"use client"

import { useState } from "react"
import "../css/CartItem.css"

// Thêm prop isSelected và onSelectChange vào component CartItem
const CartItem = ({ item, onUpdateQuantity, onRemove, isSelected, onSelectChange, disabled }) => {
  const [quantity, setQuantity] = useState(item.quantity)

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 1 || disabled) return
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
    if (!disabled) {
      onSelectChange(item._id, e.target.checked)
    }
  }

  const getStatusMessage = () => {
    // Log the item to debug
    console.log('CartItem product status:', item.product_status)
    
    if (!item.product_status) {
      console.log('No product status found for item:', item)
      return null
    }
    
    const { product_status, product_quantity } = item.product_status
    console.log('Product status:', product_status, 'Quantity:', product_quantity)
    
    if (product_status === "available" && product_quantity > 0) {
      return null // Don't show any status for available products
    }
    if (product_status === "available" && product_quantity <= 0) {
      return "Hết hàng"
    }
    return "Sản phẩm không khả dụng"
  }

  const statusMessage = getStatusMessage()
  const isAvailable = item.product_status?.product_status === "available" && 
                     item.product_status?.product_quantity > 0

  // Thêm checkbox vào đầu component
  return (
    <div className={`cart-item ${!isAvailable ? 'unavailable-item' : ''}`}>
      <div className="item-checkbox">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={handleSelectChange}
          disabled={disabled}
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
          {statusMessage && (
            <div className="status-badges">
              <span className={`status-badge ${!isAvailable ? 'unavailable' : 'out-of-stock'}`}>
                {statusMessage}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="cart-item-right">
        <div className="quantity-controls">
          <button
            onClick={() => {
              if (item.quantity > 1) {
                onUpdateQuantity(item._id, item.quantity - 1)
              }
            }}
            disabled={disabled || item.quantity <= 1}
            className="quantity-btn"
          >
            -
          </button>
          <span className="quantity">{item.quantity}</span>
          <button
            onClick={() => onUpdateQuantity(item._id, item.quantity + 1)}
            disabled={disabled}
            className="quantity-btn"
          >
            +
          </button>
        </div>
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
