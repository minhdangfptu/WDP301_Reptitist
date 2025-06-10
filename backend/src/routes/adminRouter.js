const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const {
    checkAdminRole,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    toggleUserStatus,
    getUserStats,
    searchUsers,
    createUser
} = require('../controllers/adminController');

// Apply auth middleware to all admin routes
router.use(authMiddleware);
router.use(checkAdminRole);

// User management routes
router.get('/users', getAllUsers);                    // GET /admin/users - Lấy tất cả người dùng
router.get('/users/search', searchUsers);             // GET /admin/users/search - Tìm kiếm người dùng
router.get('/users/stats', getUserStats);             // GET /admin/users/stats - Thống kê người dùng
router.get('/users/:userId', getUserById);            // GET /admin/users/:id - Lấy thông tin một người dùng
router.post('/users', createUser);                    // POST /admin/users - Tạo người dùng mới
router.put('/users/:userId', updateUser);             // PUT /admin/users/:id - Cập nhật thông tin người dùng
router.patch('/users/:userId/status', toggleUserStatus); // PATCH /admin/users/:id/status - Thay đổi trạng thái
router.delete('/users/:userId', deleteUser);          // DELETE /admin/users/:id - Xóa người dùng

module.exports = router;