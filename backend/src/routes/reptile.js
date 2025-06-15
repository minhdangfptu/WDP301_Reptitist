const express = require('express');
const router = express.Router();

const reptileController = require('../controllers/reptileController');
const authMiddleware1 = require('../middleware/authMiddlewareModify')
const roleMiddleware = require('../middleware/roleMiddleware');

//Api create repltile infomation: Chỉ admin mới có quyền thực hiện api này
router.post(
  '/create-reptile',
  authMiddleware1,
  roleMiddleware('admin'),         // Kiểm tra quyền admin
  reptileController.createReptile // Hàm callback cho việc tạo reptile
);

//Api lấy ra tất cả reptile infomation: Tất cả mọi người đều có quyền thực hiện api này
router.get(
  '/get-all-reptile',
  reptileController.getAllReptiles
);

//Api cập nhật reptile infomation: Chỉ admin mới có quyền thực hiện api này
router.put(
  '/update-reptile',
authMiddleware1,
roleMiddleware('admin'),  
  reptileController.updateReptileById
);

//Api xóa reptile infomation: Chỉ admin mới có quyền thực hiện api này
router.delete(
  '/delete-reptile',
roleMiddleware('admin'),  
  reptileController.deleteReptileById
);

//Api lấy ra reptile infomation theo user đang đăng nhập
router.get('/my-reptiles', reptileController.getReptilesByUser);

//Api lấy ra reptile infomation theo id: Tất cả mọi người đều có quyền thực hiện api này
router.get(
  '/get-reptile-by-id',
  reptileController.getReptileById
);

module.exports = router;
