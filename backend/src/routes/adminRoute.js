const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware1 = require('../middleware/authMiddlewareModify')
const roleMiddleware = require('../middleware/roleMiddleware');

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
    getIncomeByTime,
    getFinancialReports
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

// Report management routes
router.get('/reports', getAllProductReports);         // GET /admin/reports
router.post('/reports/:reportId/handle', handleProductReport); // POST /admin/reports/:id/handle

// Statistics
router.get('/stats', getAdminStats);                  // GET /admin/stats
router.get('/income', getIncomeByTime);               // GET /admin/income

// Financial reports
router.get('/financial-reports', getFinancialReports); // GET /admin/financial-reports

module.exports = router;