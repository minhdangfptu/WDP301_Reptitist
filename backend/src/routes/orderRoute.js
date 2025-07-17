const express = require('express');
const router = express.Router();

const orderController = require('../controllers/orderController');
const authMiddleware1 = require('../middleware/authMiddlewareModify')
const roleMiddleware = require('../middleware/roleMiddleware');


router.post(
  '/create-order',
  authMiddleware1,
  roleMiddleware('admin','customer'),         // Kiểm tra quyền admin
  orderController.createOrder // Hàm callback cho việc tạo reptile
);

router.get('/my-order',authMiddleware1, orderController.getAllOrderByUser);

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

router.get(
  '/shop-orders',
  authMiddleware1,
  orderController.getAllOrdersByShop
);

router.put('/mark-shipped-order', 
    authMiddleware1, 
    orderController.markOrderAsShippedByShop);


module.exports = router;