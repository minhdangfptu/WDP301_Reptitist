import { useState } from "react"
import { useNavigate } from "react-router-dom"
import "../css/CartSummary.css"
import { useAuth } from '../context/AuthContext'; 
import CheckoutModal from './CheckoutModal'; 
import { createOrder } from '../api/orderApi'; 
import { ToastContainer } from "react-toastify";

import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';

// Cập nhật CartSummary để hiển thị thông tin về sản phẩm được chọn
const CartSummary = ({ totalAmount, totalItems, unavailableItems = [], selectedItems = [] }) => {
  const [promoCode, setPromoCode] = useState("")
  const [discount, setDiscount] = useState(0)
  const [showCheckoutModal, setShowCheckoutModal] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
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

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      alert("Vui lòng chọn ít nhất một sản phẩm để thanh toán")
      return
    }
    
    // Hiển thị modal xác nhận thông tin giao hàng
    setShowCheckoutModal(true)
  }

  const handleConfirmOrder = async (deliveryInfo) => {
    if (isProcessing) return

    try {
      setIsProcessing(true)
      
      // Chuyển selectedItems thành mảng order_items đúng định dạng
      const order_items = selectedItems.map(item => ({
        product_id: item.product_id?._id || item.product_id,
        quantity: item.quantity
      }))

      // Tạo đơn hàng với thông tin giao hàng
      

      await createOrder(order_items, deliveryInfo)
      
      // Đóng modal và thông báo thành công
      setShowCheckoutModal(false)
      toast.success("Tạo đơn hàng thành công!")
      
      
       navigate('/my-orders') // Nếu có trang quản lý đơn hàng
      
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
          className={`checkout-btn ${selectedItems.length === 0 || isProcessing ? "disabled-btn" : ""}`}
          onClick={handleCheckout}
          disabled={selectedItems.length === 0 || isProcessing}
        >
          {isProcessing ? "Đang xử lý..." : "Tạo đơn hàng"}
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
