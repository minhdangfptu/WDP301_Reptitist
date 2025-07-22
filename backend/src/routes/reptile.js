const express = require('express');
const router = express.Router();

const reptileController = require('../controllers/reptileController');
const authMiddleware1 = require('../middleware/authMiddlewareModify');
const roleMiddleware = require('../middleware/roleMiddleware');

// Api create reptile: Chỉ admin mới có quyền
router.post(
  '/create-reptile',
  authMiddleware1,
  roleMiddleware('admin'),
  reptileController.createReptile
);

// Api lấy tất cả reptile: Ai cũng xem được
router.get(
  '/get-all-reptile',
  reptileController.getAllReptiles
);

// Api cập nhật reptile: Chỉ admin
router.put(
  '/update-reptile',
  authMiddleware1,
  roleMiddleware('admin'),
  reptileController.updateReptileById
);

// Api xoá reptile: Chỉ admin
router.delete(
  '/delete-reptile',
  authMiddleware1,
 roleMiddleware('admin'),
  reptileController.deleteReptileById
);

// Api lấy reptile theo user đang đăng nhập
router.get(
  '/my-reptiles',
  authMiddleware1,
  reptileController.getReptilesByUser
);

// Api lấy reptile theo ID
router.get(
  '/get-reptile-by-id',
  reptileController.getReptileById
);

module.exports = router;
