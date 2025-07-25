const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware1 = require('../middleware/authMiddlewareModify');
const roleMiddleware = require('../middleware/roleMiddleware');

// Tạo đơn hàng
router.post(
  '/create-order',
  authMiddleware1,
  orderController.createOrder 
);

// Lấy danh sách đơn hàng của user
router.get('/my-order', authMiddleware1, orderController.getAllOrderByUser);

// Lấy chi tiết đơn hàng theo ID
router.get(
  '/get-order-by-id',
  authMiddleware1,
  orderController.getOrderById
);

// ✅ FIXED: User cập nhật trạng thái đơn hàng (hủy đơn, xác nhận hoàn thành)
router.get(
  '/update-order-status',
  authMiddleware1,
  orderController.updateOrderStatus
);

// ✅ FIXED: Shop cập nhật trạng thái đơn hàng (giao hàng, giao thất bại)
router.get(
  '/update-order-status-by-shop',
  authMiddleware1,
  orderController.updateOrderStatusByShop
);

// Lấy danh sách đơn hàng của shop
router.get(
  '/shop-orders',
  authMiddleware1,
  orderController.getAllOrdersByShop
);

// ✅ FIXED: Shop đánh dấu đơn hàng đang vận chuyển (không trừ kho)
router.put('/mark-shipped-order', 
    authMiddleware1, 
    orderController.markOrderAsShippedByShop);

// Xóa mềm đơn hàng
router.delete('/order/:id', authMiddleware1, orderController.softDeleteOrder);

// ✅ THÊM: Route debug để kiểm tra trạng thái đơn hàng
router.get('/debug-order/:id', authMiddleware1, orderController.debugOrderStatus);

module.exports = router;