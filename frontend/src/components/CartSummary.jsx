import { useState } from "react"
import { useNavigate } from "react-router-dom"
import "../css/CartSummary.css"
import { useAuth } from '../context/AuthContext'; 
import CheckoutModal from './CheckoutModal'; 
import { createOrder } from '../api/orderApi'; 
import { checkStockAvailability } from '../api/productApi';
import { ToastContainer } from "react-toastify";

import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';

// Cập nhật CartSummary để hiển thị thông tin về sản phẩm được chọn
const CartSummary = ({ 
  totalAmount, 
  totalItems, 
  unavailableItems = [], 
  selectedItems = [],
  onUpdateCartQuantity // Thêm prop này để update cart từ parent component
}) => {
  const [promoCode, setPromoCode] = useState("")
  const [discount, setDiscount] = useState(0)
  const [showCheckoutModal, setShowCheckoutModal] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isCheckingStock, setIsCheckingStock] = useState(false) // Thêm state cho loading check stock
  const navigate = useNavigate()
  const { user } = useAuth() 

  const finalTotal = totalAmount - discount

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price)
  }

  const handleApplyPromo = () => {
    if (promoCode === "DISCOUNT10") {
      setDiscount(totalAmount * 0.1)
    } else if (promoCode === "SAVE50K") {
      setDiscount(50000)
    } else {
      setDiscount(0)
      alert("Mã giảm giá không hợp lệ")
    }
  }

  const handleCheckout = async () => {
    if (selectedItems.length === 0) {
      toast.warning("Vui lòng chọn ít nhất một sản phẩm để thanh toán")
      return
    }

    setIsCheckingStock(true)
    
    try {
      // Check stock cho tất cả selected items
      const stockResults = await Promise.all(
        selectedItems.map(async (item) => {
          try {
            const productId = item.product_id?._id || item.product_id
            const stockData = await checkStockAvailability(productId)
            
            const isAvailable = stockData.product_status === "available"
            const availableStock = stockData.product_quantity || 0

            
            return {
              ...item,
              productId,
              availableStock,
              isStockSufficient: isAvailable && availableStock >= item.quantity,
              isProductAvailable: isAvailable
            }
          } catch (error) {
            console.error(`Error checking stock for product ${item.product_id}:`, error)
            return {
              ...item,
              availableStock: 0,
              isStockSufficient: false,
              isProductAvailable: false,
              error: true
            }
          }
        })
      )
      console.log("Stock check results:", stockResults)

      // Kiểm tra xem có sản phẩm nào không đủ stock không
      const insufficientStock = stockResults.filter(item => !item.isStockSufficient)
      
      if (insufficientStock.length > 0) {
        // Có sản phẩm không đủ stock
        let hasUpdates = false
        const updates = []

        // Tạo thông báo và chuẩn bị update
        insufficientStock.forEach(item => {
          const productName = item.product_id?.name || 'Sản phẩm'
          
          if (item.error) {
            toast.error(`Không thể kiểm tra tồn kho cho ${productName}`)
          } else if (!item.isProductAvailable) {
            toast.error(`${productName} hiện không có sẵn`)
            // Remove item khỏi cart vì product không available
            updates.push({
              productId: item.productId,
              newQuantity: 0,
              action: 'remove'
            })
            hasUpdates = true
          } else if (item.availableStock === 0) {
            toast.error(`${productName} đã hết hàng`)
            // Remove item khỏi cart vì hết hàng
            updates.push({
              productId: item.productId,
              newQuantity: 0,
              action: 'remove'
            })
            hasUpdates = true
          } else {
            toast.warning(
              `${productName} chỉ còn ${item.availableStock} sản phẩm. ` +
              `Số lượng trong giỏ hàng đã được cập nhật từ ${item.quantity} về ${item.availableStock}.`
            )
            // Update quantity về available stock
            updates.push({
              productId: item.productId,
              newQuantity: item.availableStock,
              action: 'update'
            })
            hasUpdates = true
          }
        })

        if (hasUpdates && onUpdateCartQuantity) {
          updates.forEach(update => {
            onUpdateCartQuantity(update.productId, update.newQuantity, update.action)
          })
          
          toast.info("Giỏ hàng đã được cập nhật. Vui lòng kiểm tra lại và thử thanh toán.")
        }
        
        return
      }

      toast.success("Kiểm tra tồn kho thành công!")
      setShowCheckoutModal(true)
      
    } catch (error) {
      console.error("Error checking stock:", error)
      toast.error("Có lỗi xảy ra khi kiểm tra tồn kho. Vui lòng thử lại.")
    } finally {
      setIsCheckingStock(false)
    }
  }

  const handleConfirmOrder = async (deliveryInfo) => {
    if (isProcessing) return

    try {
      setIsProcessing(true)
      
      // Double check stock một lần nữa trước khi tạo order (optional nhưng recommended)
      const finalStockCheck = await Promise.all(
        selectedItems.map(async (item) => {
          const productId = item.product_id?._id || item.product_id
          const stockData = await checkStockAvailability(productId)
          const isAvailable = stockData.product_status === "available"
          const availableStock = stockData.product_quantity || 0
          return isAvailable && availableStock >= item.quantity
        })
      )

      if (!finalStockCheck.every(Boolean)) {
        toast.error("Tồn kho đã thay đổi trong quá trình xử lý. Vui lòng kiểm tra lại giỏ hàng.")
        setShowCheckoutModal(false)
        return
      }
      
      // Chuyển selectedItems thành mảng order_items đúng định dạng
      const order_items = selectedItems.map(item => ({
        product_id: item.product_id?._id || item.product_id,
        quantity: item.quantity
      }))

      await createOrder(order_items, deliveryInfo)
      
      // Đóng modal và thông báo thành công
      setShowCheckoutModal(false)
      toast.success("Tạo đơn hàng thành công!")
      
      navigate('/my-orders')
      
    } catch (err) {
      setShowCheckoutModal(false)
      toast.error("Đã xảy ra lỗi khi tạo đơn hàng. Vui lòng thử lại sau.")
      console.error(err)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCloseModal = () => {
    if (!isProcessing) {
      setShowCheckoutModal(false)
    }
  }

  return (
    <>
      <div className="cart-summary">
        <h3>Tóm tắt đơn hàng</h3>

        {unavailableItems.length > 0 && (
          <div className="unavailable-warning">
            <p>⚠️ Có {unavailableItems.length} sản phẩm không khả dụng trong giỏ hàng</p>
            <p>Vui lòng xóa để tiếp tục thanh toán</p>
          </div>
        )}

        {selectedItems.length === 0 && (
          <div className="no-selection-warning">
            <p>⚠️ Chưa có sản phẩm nào được chọn</p>
            <p>Vui lòng chọn sản phẩm để tiếp tục thanh toán</p>
          </div>
        )}

        <div className="promo-section">
          <input
            type="text"
            placeholder="Nhập mã giảm giá"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            className="promo-input"
          />
          <button onClick={handleApplyPromo} className="apply-promo-btn">
            Áp dụng
          </button>
        </div>

        <div className="summary-details">
          <div className="summary-row">
            <span>Tạm tính ({totalItems} sản phẩm đã chọn)</span>
            <span>{formatPrice(totalAmount)}</span>
          </div>

          {discount > 0 && (
            <div className="summary-row discount">
              <span>Giảm giá</span>
              <span>-{formatPrice(discount)}</span>
            </div>
          )}

          <div className="summary-divider"></div>

          <div className="summary-row total">
            <span>Tổng cộng</span>
            <span>{formatPrice(finalTotal)}</span>
          </div>
        </div>

        <button
          className={`checkout-btn ${selectedItems.length === 0 || isProcessing || isCheckingStock ? "disabled-btn" : ""}`}
          onClick={handleCheckout}
          disabled={selectedItems.length === 0 || isProcessing || isCheckingStock}
        >
          {isCheckingStock ? "Đang kiểm tra tồn kho..." : 
           isProcessing ? "Đang xử lý..." : 
           "Tạo đơn hàng"}
        </button>

        <button className="continue-shopping-btn-secondary" onClick={() => navigate('/ShopLandingPage')}>
          Tiếp tục mua sắm
        </button>
      </div>

      <CheckoutModal
        isOpen={showCheckoutModal}
        onClose={handleCloseModal}
        onConfirm={handleConfirmOrder}
        selectedItems={selectedItems}
        totalAmount={finalTotal}
        user={user}
      />
    </>
  )
}

export default CartSummary