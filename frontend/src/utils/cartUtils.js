// Hàm kiểm tra sản phẩm có sẵn để mua không
export const isProductAvailable = (product) => {
    return product.product_status === "available" && product.product_quantity > 0
  }
  
  // Hàm tính toán tổng tiền giỏ hàng cho các sản phẩm được chọn
  export const calculateCartTotal = (items, selectedItemIds = {}) => {
    return items.reduce((total, item) => {
      // Chỉ tính các sản phẩm có sẵn và được chọn
      if (isProductAvailable(item.product_id) && selectedItemIds[item._id]) {
        return total + item.product_id.product_price * item.quantity
      }
      return total
    }, 0)
  }
  
  // Hàm tính tổng số lượng sản phẩm trong giỏ hàng cho các sản phẩm được chọn
  export const calculateTotalItems = (items, selectedItemIds = {}) => {
    return items.reduce((total, item) => {
      // Chỉ đếm các sản phẩm có sẵn và được chọn
      if (isProductAvailable(item.product_id) && selectedItemIds[item._id]) {
        return total + item.quantity
      }
      return total
    }, 0)
  }
  
  // Hàm định dạng giá tiền
  export const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price)
  }