const express = require('express');
const router = express.Router();

const reptileController = require('../controllers/reptileController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

//Api create repltile infomation: Chỉ admin mới có quyền thực hiện api này
router.post(
  '/create-reptile',
  authMiddleware,
  roleMiddleware('admin'),
  reptileController.createReptile
);

//Api lấy ra tất cả reptile infomation: Tất cả mọi người đều có quyền thực hiện api này
router.get(
  '/get-all-reptile',
  reptileController.getAllReptiles
);

//Api cập nhật reptile infomation: Chỉ admin mới có quyền thực hiện api này
router.put(
  '/update-reptile',
  authMiddleware,
  roleMiddleware('admin'),
  reptileController.updateReptileById
);

//Api xóa reptile infomation: Chỉ admin mới có quyền thực hiện api này
router.delete(
  '/delete-reptile',
  authMiddleware,
  roleMiddleware('admin'),
  reptileController.deleteReptileById
);

//Api lấy ra reptile infomation theo user đang đăng nhập
router.get('/my-reptiles', authMiddleware, reptileController.getReptilesByUser);

//Api lấy ra reptile infomation theo id: Tất cả mọi người đều có quyền thực hiện api này
router.get(
  '/get-reptile-by-id',
  reptileController.getReptileById
);

module.exports = router;
