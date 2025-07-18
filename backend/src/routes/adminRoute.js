const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware1 = require('../middleware/authMiddlewareModify')
const roleMiddleware = require('../middleware/roleMiddleware');
const Product = require('../models/Products');
const { sendProductHideNotification, sendProductUnhideNotification } = require('../config/email');
const User = require('../models/users');

// Import các middleware từ adminRouter
const { authMiddleware } = require('../middleware/authMiddleware');
const {
    checkAdminRole,
    getAllUsers,
    getAllShops,
    getShopProducts,
    deleteProductByAdmin,
    getAllProductReports,
    handleProductReport,
    getAdminStats,
    searchUsers,
    getUserById,
    updateUser,
    deleteUser,
    toggleUserStatus,
    updateUserAccountType
} = require('../controllers/adminController');

router.get(
  '/approve-product-by-id',
  authMiddleware1,
  roleMiddleware('admin'), // Only admin can approve products
  productController.approveProduct
);

// Apply auth middleware cho các route còn lại (từ adminRouter)
router.use(authMiddleware);
router.use(checkAdminRole);

// User management routes
router.get('/users', getAllUsers);                    // GET /admin/users
router.get('/users/search', searchUsers);             // GET /admin/users/search
router.get('/users/:userId', getUserById);            // GET /admin/users/:id
router.put('/users/:userId', updateUser);             // PUT /admin/users/:id
router.patch('/users/:userId/status', toggleUserStatus); // PATCH /admin/users/:id/status
router.patch('/users/:userId/account-type', updateUserAccountType); // PATCH /admin/users/:id/account-type
router.delete('/users/:userId', deleteUser);          // DELETE /admin/users/:id

// Shop management routes
router.get('/shops', getAllShops);                    // GET /admin/shops
router.get('/shops/:shopId/products', getShopProducts); // GET /admin/shops/:shopId/products

// Product management routes (admin can only delete)
router.delete('/products/:productId', deleteProductByAdmin); // DELETE /admin/products/:id

// Cập nhật trạng thái sản phẩm (ẩn/bỏ ẩn)
router.put('/products/:productId/status', async (req, res) => {
  try {
    const { productId } = req.params;
    const { product_status, hideReason, adminName } = req.body;
    const update = { product_status };
    if (product_status === 'not_available' && hideReason) {
      update.hideReason = hideReason;
    }
    const product = await Product.findByIdAndUpdate(productId, update, { new: true }).populate('user_id', 'email username');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Gửi email khi ẩn hoặc bỏ ẩn sản phẩm
    let emailSent = false;
    if (product_status === 'not_available' && product.user_id && product.user_id.email) {
      try {
        await sendProductHideNotification(
          product.user_id.email,
          product.user_id.username || '',
          product.product_name,
          adminName || 'Admin',
          hideReason || ''
        );
        emailSent = true;
      } catch (e) {}
    }
    if (product_status === 'available' && product.user_id && product.user_id.email) {
      try {
        await sendProductUnhideNotification(
          product.user_id.email,
          product.user_id.username || '',
          product.product_name,
          adminName || 'Admin'
        );
        emailSent = true;
      } catch (e) {}
    }

    res.json({ product, emailSent });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Thêm route lấy tất cả sản phẩm hoặc lọc theo trạng thái
router.get('/products', async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    if (status) {
      query.product_status = status;
    }
    const products = await Product.find(query).populate('user_id', 'username email');
    res.json({ products });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Report management routes
router.get('/reports', getAllProductReports);         // GET /admin/reports
router.post('/reports/:reportId/handle', handleProductReport); // POST /admin/reports/:id/handle

// Statistics
router.get('/stats', getAdminStats);                  // GET /admin/stats

module.exports = router;