const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware1 = require('../middleware/authMiddlewareModify')
const roleMiddleware = require('../middleware/roleMiddleware');
const upgradePlanController = require('../controllers/upgradePlanController');
const Product = require('../models/Products');
const { sendProductHideNotification, sendProductUnhideNotification } = require('../config/email');
const User = require('../models/users');
const ProductReport = require('../models/Product_reports'); // Thêm dòng này ở đầu file

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
    updateUserAccountType,
    getHiddenProducts,
    updateProductStatusByAdmin,
    getIncomeByTime,
    getFinancialReports
} = require('../controllers/adminController');

// Apply auth middleware to all admin routes
router.use(authMiddleware);
router.use(checkAdminRole);

// User management routes
router.get('/users', getAllUsers);                    // GET /admin/users - Lấy tất cả người dùng
router.get('/users/search', searchUsers);             // GET /admin/users/search - Tìm kiếm người dùng
router.get('/users/:userId', getUserById);            // GET /admin/users/:id - Lấy thông tin một người dùng
router.put('/users/:userId', updateUser);             // PUT /admin/users/:id - Cập nhật thông tin người dùng
router.patch('/users/:userId/status', toggleUserStatus); // PATCH /admin/users/:id/status - Thay đổi trạng thái
router.patch('/users/:userId/account-type', updateUserAccountType); // PATCH /admin/users/:id/account-type - Cập nhật loại tài khoản
router.delete('/users/:userId', deleteUser);          // DELETE /admin/users/:id - Xóa người dùng

// Shop management routes
router.get('/shops', getAllShops);                    // GET /admin/shops - Lấy tất cả shop
router.get('/shops/:shopId/products', getShopProducts); // GET /admin/shops/:shopId/products - Lấy sản phẩm của shop

// Product management routes (admin can only delete)
router.get('/products', getHiddenProducts); // GET /admin/products?status=not_available - Lấy sản phẩm bị ẩn
router.put('/products/:productId/status', updateProductStatusByAdmin); // PUT /admin/products/:productId/status - Cập nhật trạng thái sản phẩm
router.delete('/products/:productId', deleteProductByAdmin); // DELETE /admin/products/:id - Xóa sản phẩm

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
          hideReason || '',
          product._id
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
      // Xóa tất cả các báo cáo liên quan đến sản phẩm này khi bỏ ẩn
      await ProductReport.deleteMany({ product_id: productId });
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
router.get('/reports', getAllProductReports);         // GET /admin/reports - Lấy tất cả báo cáo
router.post('/reports/:reportId/handle', handleProductReport); // POST /admin/reports/:id/handle - Xử lý báo cáo

// Statistics
router.get('/stats', getAdminStats);                   // GET /admin/stats
router.get('/income', getIncomeByTime);               // GET /admin/income

// Financial reports
router.get('/financial-reports', getFinancialReports); // GET /admin/financial-reports

// Upgrade Plan management (admin only)
router.get('/get-upgrade-plans', authMiddleware1,  upgradePlanController.getUpgradePlans);
router.post('/create-upgrade-plans', authMiddleware1,  upgradePlanController.createUpgradePlan);
router.put('/update-upgrade-plans/:id', authMiddleware1,  upgradePlanController.updateUpgradePlan);
router.delete('/delete-upgrade-plans/:id',authMiddleware1,  upgradePlanController.deleteUpgradePlan);

module.exports = router;