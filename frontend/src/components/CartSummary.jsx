"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import "../css/CartSummary.css"

// Cập nhật CartSummary để hiển thị thông tin về sản phẩm được chọn
const CartSummary = ({ totalAmount, totalItems, unavailableItems = [], selectedItems = [] }) => {
  const [promoCode, setPromoCode] = useState("")
  const [discount, setDiscount] = useState(0)
  const navigate = useNavigate()

  const shippingFee = totalAmount > 500000 ? 0 : 30000 // Free shipping over 500k VND
  const tax = totalAmount * 0.1 // 10% tax
  const finalTotal = totalAmount - discount + shippingFee + tax

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

    // Tạo đơn hàng với các sản phẩm đã chọn
    alert(`Đang tạo đơn hàng với ${selectedItems.length} sản phẩm đã chọn...`)
    console.log("Sản phẩm đã chọn:", selectedItems)
  }

  return (
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

        <div className="summary-row">
          <span>Phí vận chuyển</span>
          <span>{shippingFee === 0 ? "Miễn phí" : formatPrice(shippingFee)}</span>
        </div>

        <div className="summary-row">
          <span>Thuế VAT (10%)</span>
          <span>{formatPrice(tax)}</span>
        </div>

        <div className="summary-divider"></div>

        <div className="summary-row total">
          <span>Tổng cộng</span>
          <span>{formatPrice(finalTotal)}</span>
        </div>
      </div>

      <button
        className={`checkout-btn ${selectedItems.length === 0 ? "disabled-btn" : ""}`}
        onClick={handleCheckout}
        disabled={selectedItems.length === 0}
      >
        Tạo đơn hàng
      </button>

      <button className="continue-shopping-btn-secondary" onClick={() => navigate('/ShopLandingPage')}>Tiếp tục mua sắm</button>
    </div>
  )
}

export default CartSummary
