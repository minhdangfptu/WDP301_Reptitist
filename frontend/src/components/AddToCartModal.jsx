"use client"

import { useState, useEffect } from "react"
import { Plus, Minus, ShoppingCart, X } from "lucide-react"
import "../css/AddToCartModal.css"

const AddToCartModal = ({ isOpen, onClose, product,onAddToCart }) => {
  const [quantity, setQuantity] = useState(1)

  // Close modal when clicking outside
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, onClose])

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change
    if (newQuantity >= 1 && newQuantity <= product.product_quantity) {
      setQuantity(newQuantity)
    }
  }

  const handleAddToCart = () => {
    onAddToCart(product._id, quantity)
    onClose()
    setQuantity(1) // Reset quantity after adding
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) return null

  const totalPrice = product.product_price * quantity

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className="modal-content">
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">
            <ShoppingCart className="modal-icon" />
            Thêm vào giỏ hàng
          </h2>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Product Info */}
          <div className="product-info">
            <div className="product-image">
              <img
                src={product.product_imageurl?.[0] || "/placeholder.svg?height=80&width=80"}
                alt={product.product_name}
              />
            </div>
            <div className="product-details">
              <h3 className="product-name">{product.product_name}</h3>
              <p className="product-price">₫{product.product_price.toLocaleString()}</p>
              <p className="product-stock">Còn lại: {product.product_quantity} sản phẩm</p>
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="quantity-section">
            <label className="quantity-label">Số lượng</label>
            <div className="quantity-controls">
              <button className="quantity-btn" onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}>
                <Minus size={16} />
              </button>

              <input
                type="number"
                value={quantity}
                onChange={(e) => {
                  const value = Math.max(1, Math.min(product.product_quantity, Number(e.target.value) || 1))
                  setQuantity(value)
                }}
                className="quantity-input"
                min="1"
                max={product.product_quantity}
              />

              <button
                className="quantity-btn"
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= product.product_quantity}
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Total Price */}
          <div className="total-section">
            <div className="total-row">
              <span className="total-label">Tổng cộng:</span>
              <span className="total-price">₫{totalPrice.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn btn-cancel" onClick={onClose}>
            Hủy
          </button>
          <button className="btn btn-primary" onClick={handleAddToCart}>
            <ShoppingCart size={16} />
            Thêm vào giỏ
          </button>
        </div>
      </div>
    </div>
  )
}
export default AddToCartModal;
