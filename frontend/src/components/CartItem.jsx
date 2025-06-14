"use client"

import { useState } from "react"
import "../css/CartItem.css"

// Thêm prop isSelected và onSelectChange vào component CartItem
const CartItem = ({ item, onUpdateQuantity, onRemove, isSelected, onSelectChange, productStatus }) => {
  const [quantity, setQuantity] = useState(item.quantity)

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 1 || (productStatus && newQuantity > productStatus.quantity)) return
    setQuantity(newQuantity)
    onUpdateQuantity(item._id, newQuantity)
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price)
  }

  // Thêm hàm xử lý khi checkbox thay đổi
  const handleSelectChange = (e) => {
    onSelectChange(item._id, e.target.checked)
  }

  // Kiểm tra trạng thái sản phẩm
  const isAvailable = productStatus ? productStatus.isAvailable : true

  // Thêm checkbox vào đầu component
  return (
    <div className={`cart-item ${!isAvailable ? "unavailable-item" : ""}`}>
      <div className="item-checkbox">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={handleSelectChange}
          disabled={!isAvailable}
          className="item-select-checkbox"
          id={`item-${item._id}`}
        />
        <label htmlFor={`item-${item._id}`} className="checkbox-label"></label>
      </div>

      <div className="item-info">
        <img
          src={item.product_image && item.product_image.length > 0 ? item.product_image[0] : "/placeholder.svg?height=100&width=100"}
          alt={item.product_name}
          className="item-image"
        />
        <div className="item-details">
          <h3>{item.product_name}</h3>
          {!isAvailable && <span className="status-badge">Không khả dụng</span>}
          {productStatus && (
            <span className="stock-info">
              Còn {productStatus.quantity} sản phẩm
            </span>
          )}
        </div>
      </div>

      <div className="quantity-controls">
        <button
          className="quantity-btn"
          onClick={() => handleQuantityChange(quantity - 1)}
          disabled={quantity <= 1 || !isAvailable}
        >
          -
        </button>
        <span className="quantity-display">{quantity}</span>
        <button
          className="quantity-btn"
          onClick={() => handleQuantityChange(quantity + 1)}
          disabled={!isAvailable || (productStatus && quantity >= productStatus.quantity)}
        >
          +
        </button>
      </div>

      <div className="item-price">{formatPrice(item.price)}</div>

      <div className="item-subtotal">{formatPrice(item.subtotal)}</div>

      <button className="remove-btn" onClick={() => onRemove(item._id)} title="Xóa sản phẩm">
        ×
      </button>
    </div>
  )
}

export default CartItem
