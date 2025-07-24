const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware1 = require('../middleware/authMiddlewareModify')
const roleMiddleware = require('../middleware/roleMiddleware');

router.post(
  '/create-order',
  authMiddleware1,
  orderController.createOrder // Hàm callback cho việc tạo reptile
);

router.get('/my-order', authMiddleware1, orderController.getAllOrderByUser);

router.get(
  '/get-order-by-id',
  authMiddleware1,
  orderController.getOrderById
);

router.get(
  '/update-order-status',
  authMiddleware1,
  orderController.updateOrderStatus
);

// ✅ THÊM ROUTE MỚI CHO SHOP CẬP NHẬT TRẠNG THÁI
router.get(
  '/update-order-status-by-shop',
  authMiddleware1,
  orderController.updateOrderStatusByShop
);

router.get(
  '/shop-orders',
  authMiddleware1,
  orderController.getAllOrdersByShop
);

router.put('/mark-shipped-order', 
    authMiddleware1, 
    orderController.markOrderAsShippedByShop);

router.delete('/order/:id', authMiddleware1, orderController.softDeleteOrder);

module.exports = router;