const express = require('express');
const router = express.Router();
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
    updateProductStatusByAdmin
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

// Report management routes
router.get('/reports', getAllProductReports);         // GET /admin/reports - Lấy tất cả báo cáo
router.post('/reports/:reportId/handle', handleProductReport); // POST /admin/reports/:id/handle - Xử lý báo cáo

// Statistics
router.get('/stats', getAdminStats);                  // GET /admin/stats - Thống kê tổng quan

module.exports = router;