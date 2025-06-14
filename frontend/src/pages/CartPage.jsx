"use client"

import { useState, useEffect } from "react"
import { ShoppingCart } from "lucide-react"
import CartItem from "../components/CartItem"
import CartSummary from "../components/CartSummary"
import CustomHeader from "../components/CustomHeader"
import "../css/CustomHeader.css"
import "../css/CartPage.css"
// Import các utility functions
import { isProductAvailable } from "../utils/cartUtils"
import { getCartService, deleteProductFromCartService,checkProductAvailabilityService } from "../services/cartService"
import { toast } from "react-toastify"
import axios from "axios"

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
      setCartItems(response.cart.cart_items || [])
      
      // Initialize selected items
      const initialSelectedState = {}
      response.cart.cart_items?.forEach((item) => {
        initialSelectedState[item._id] = true
      })
      setSelectedItems(initialSelectedState)

      // Check product status for each item
      for (const item of response.cart.cart_items || []) {
        const status = await checkProductAvailabilityService(item.product_id._id)
        item.product_status = status
      }
    } catch (err) {
      setError("Failed to load cart data")
      toast.error("Không thể tải dữ liệu giỏ hàng")
      console.error("Error fetching cart:", err)
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
    if (newQuantity < 1) return

    try {
      // Call API to update quantity
      await addToCartService(itemId, newQuantity)
      // Refresh cart data
      await fetchCartData()
      toast.success("Cập nhật số lượng thành công")
    } catch (err) {
      toast.error("Không thể cập nhật số lượng")
      console.error("Error updating quantity:", err)
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
    setSelectedItems((prev) => ({
      ...prev,
      [itemId]: isSelected,
    }))
  }

  const handleSelectAll = (isSelected) => {
    const newSelectedState = {}
    cartItems.forEach((item) => {
      newSelectedState[item._id] = isSelected
    })
    setSelectedItems(newSelectedState)
    setSelectAll(isSelected)
  }

  const getTotalAmount = () => {
    return cartItems.reduce((total, item) => {
      if (selectedItems[item._id]) {
        return total + item.subtotal
      }
      return total
    }, 0)
  }

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => {
      if (selectedItems[item._id]) {
        return total + item.quantity
      }
      return total
    }, 0)
  }

  const getSelectedItems = () => {
    return cartItems.filter((item) => selectedItems[item._id])
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
      <CustomHeader pageTitle="Giỏ Hàng" pageIcon={ShoppingCart} />
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
                    {cartItems.map((item) => (
                      <CartItem
                        key={item._id}
                        item={item}
                        onUpdateQuantity={updateQuantity}
                        onRemove={removeItem}
                        isSelected={!!selectedItems[item._id]}
                        onSelectChange={handleSelectItem}
                      />
                    ))}
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
    </>
  )
}

export default CartPage
