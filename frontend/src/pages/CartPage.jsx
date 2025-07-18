/* eslint-disable no-unused-vars */
"use client"

import { useState, useEffect } from "react"
import { Package, ShoppingCart } from "lucide-react"
import CartItem from "../components/CartItem"
import CartSummary from "../components/CartSummary"
import CustomHeader from "../components/CustomHeader"
import "../css/CustomHeader.css"
import "../css/CartPage.css"
// Import các utility functions
import { isProductAvailable } from "../utils/cartUtils"
import { getCartService, deleteProductFromCartService, checkProductAvailabilityService, addToCartService } from "../services/cartService"
import { toast } from "react-toastify"
import axios from "axios"
import ShopHeader from "../components/ShopHeader"
import { Link } from "react-router-dom"
import Footer from "../components/Footer"

const CartPage = () => {
  const [cartItems, setCartItems] = useState([])
  const [selectedItems, setSelectedItems] = useState({})
  const [selectAll, setSelectAll] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch cart data when component mounts
  useEffect(() => {
    fetchCartData()
  }, [])

  const fetchCartData = async () => {
    try {
      setLoading(true)
      const response = await getCartService()
      console.log('Cart API Response:', response)
      
      // Check product status for each item
      const itemsWithStatus = await Promise.all(
        (response.cart.cart_items || []).map(async (item) => {
          try {
            const status = await checkProductAvailabilityService(item.product_id)
            console.log('Product status for item:', item.product_id, status)
            return {
              ...item,
              product_status: status
            }
          } catch (err) {
            console.error('Error checking product status:', err)
            return {
              ...item,
              product_status: {
                product_status: "unavailable",
                product_quantity: 0
              }
            }
          }
        })
      )
      
      setCartItems(itemsWithStatus)
      
      // Initialize selected items
      const initialSelectedState = {}
      itemsWithStatus.forEach((item) => {
        const isAvailable = item.product_status?.product_status === "available" && 
                          item.product_status?.product_quantity > 0
        initialSelectedState[item._id] = isAvailable
      })
      setSelectedItems(initialSelectedState)
    } catch (err) {
      console.error("Detailed cart error:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        headers: err.response?.headers
      })
      
      let errorMessage = "Không thể tải dữ liệu giỏ hàng"
      if (err.response?.status === 401) {
        errorMessage = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
      } else if (err.response?.status === 404) {
        errorMessage = "Không tìm thấy giỏ hàng"
      } else if (!err.response) {
        errorMessage = "Không thể kết nối đến máy chủ"
      }
      
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Update selectAll when all available items are selected
  useEffect(() => {
    const allSelected = cartItems.every((item) => selectedItems[item._id])
    setSelectAll(allSelected && cartItems.length > 0)
  }, [selectedItems, cartItems])

  const updateQuantity = async (itemId, newQuantity) => {
    try {
      // Find the cart item to get its product_id
      const cartItem = cartItems.find(item => item._id === itemId)
      if (!cartItem) {
        toast.error("Không tìm thấy sản phẩm trong giỏ hàng")
        return
      }

      // Calculate the quantity change
      const quantityChange = newQuantity - cartItem.quantity

      // Update UI immediately
      setCartItems(prevItems => 
        prevItems.map(item => 
          item._id === itemId 
            ? { ...item, quantity: newQuantity, subtotal: item.price * newQuantity }
            : item
        )
      )

      // Send the quantity change to the API
      await addToCartService(cartItem.product_id, quantityChange)
      
      // If the new quantity is 0 or less, remove the item from the UI
      if (newQuantity <= 0) {
        setCartItems(prevItems => prevItems.filter(item => item._id !== itemId))
        setSelectedItems(prev => {
          const newSelected = { ...prev }
          delete newSelected[itemId]
          return newSelected
        })
      }
    } catch (err) {
      // If there's an error, revert the UI change and refresh cart
      toast.error("Không thể cập nhật số lượng")
      console.error("Error updating quantity:", err)
      await fetchCartData()
    }
  }

  const removeItem = async (itemId) => {
    try {
      await deleteProductFromCartService(itemId)
      setCartItems((prevItems) => prevItems.filter((item) => item._id !== itemId))
      setSelectedItems((prev) => {
        const newSelected = { ...prev }
        delete newSelected[itemId]
        return newSelected
      })
      toast.success("Đã xóa sản phẩm khỏi giỏ hàng")
    } catch (err) {
      toast.error("Không thể xóa sản phẩm")
      console.error("Error removing item:", err)
    }
  }

  const handleSelectItem = (itemId, isSelected) => {
    const item = cartItems.find(item => item._id === itemId)
    // Check if product is available and has sufficient quantity
    const isAvailable = item?.product_status?.product_status === "available" && 
                       item?.product_status?.product_quantity > 0
    if (isSelected && isAvailable) {
      setSelectedItems((prev) => ({
        ...prev,
        [itemId]: isSelected,
      }))
    } else if (!isSelected) {
      setSelectedItems((prev) => ({
        ...prev,
        [itemId]: isSelected,
      }))
    }
  }

  const handleSelectAll = (isSelected) => {
    const newSelectedState = {}
    cartItems.forEach((item) => {
      const isAvailable = item.product_status?.product_status === "available" && 
                         item.product_status?.product_quantity > 0
      if (isSelected && isAvailable) {
        newSelectedState[item._id] = true
      } else if (!isSelected) {
        newSelectedState[item._id] = false
      }
    })
    setSelectedItems(newSelectedState)
    setSelectAll(isSelected)
  }

  const getTotalAmount = () => {
    return cartItems.reduce((total, item) => {
      const isAvailable = item.product_status?.product_status === "available" && 
                         item.product_status?.product_quantity > 0
      if (selectedItems[item._id] && isAvailable) {
        return total + item.subtotal
      }
      return total
    }, 0)
  }

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => {
      const isAvailable = item.product_status?.product_status === "available" && 
                         item.product_status?.product_quantity > 0
      if (selectedItems[item._id] && isAvailable) {
        return total + item.quantity
      }
      return total
    }, 0)
  }

  const getSelectedItems = () => {
    return cartItems.filter((item) => {
      const isAvailable = item.product_status?.product_status === "available" && 
                         item.product_status?.product_quantity > 0
      return selectedItems[item._id] && isAvailable
    })
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Đang tải giỏ hàng...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <button onClick={fetchCartData}>Thử lại</button>
      </div>
    )
  }

  return (
    <>
      <ShopHeader />
      <div className="cart-page">
        <div className="container">
          <div className={`cart-content ${cartItems.length === 0 ? 'empty' : ''}`}>
            <div className="cart-items-section">
              {cartItems.length === 0 ? (
                <div className="empty-cart">
                  <div className="empty-cart-icon">🛒</div>
                  <h3>Giỏ hàng trống</h3>
                  <p>Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm</p>
                  <button className="continue-shopping-btn">Tiếp tục mua sắm</button>
                </div>
              ) : (
                <>
                  <div className="cart-items-header">
                    <div className="select-all-container">
                      <input
                        type="checkbox"
                        id="select-all"
                        checked={selectAll}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="select-all-checkbox"
                      />
                      <label htmlFor="select-all">Chọn tất cả</label>
                    </div>
                    <span>Sản phẩm</span>
                    <span>Số lượng</span>
                    <span>Giá</span>
                    <span>Tổng</span>
                    <span></span>
                  </div>
                  <div className="cart-items-list">
                    {cartItems.map((item) => {
                      const isAvailable = item.product_status?.product_status === "available" && 
                                        item.product_status?.product_quantity > 0
                      return (
                        <CartItem
                          key={item._id}
                          item={item}
                          onUpdateQuantity={updateQuantity}
                          onRemove={removeItem}
                          isSelected={!!selectedItems[item._id]}
                          onSelectChange={handleSelectItem}
                          disabled={!isAvailable}
                        />
                      )
                    })}
                  </div>
                </>
              )}
            </div>

            {cartItems.length > 0 && (
              <CartSummary
                totalItems={getTotalItems()}
                totalAmount={getTotalAmount()}
                selectedItems={getSelectedItems()}
              />
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default CartPage