const ProductAvailability = ({ status, quantity }) => {
  let statusText = ""
  let statusClass = ""

  switch (status) {
    case "available":
      statusText = "Còn hàng"
      statusClass = "status-available"
      break
    case "pending":
      statusText = "Đang xử lý"
      statusClass = "status-pending"
      break
    case "not_available":
      statusText = "Hết hàng"
      statusClass = "status-unavailable"
      break
    default:
      statusText = "Không xác định"
      statusClass = ""
  }

  return (
    <div className="product-availability">
      <span className={`status-indicator ${statusClass}`}>{statusText}</span>
      {status === "available" && quantity > 0 && <span className="quantity-indicator">({quantity} sản phẩm)</span>}
    </div>
  )
}

export default ProductAvailability
