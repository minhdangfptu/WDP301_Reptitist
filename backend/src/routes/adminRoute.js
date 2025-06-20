const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware1 = require('../middleware/authMiddlewareModify')
const roleMiddleware = require('../middleware/roleMiddleware');

router.get(
  '/approve-product-by-id',
  authMiddleware1,
  roleMiddleware('admin'), // Only admin can approve products
  productController.approveProduct
);

module.exports = router;