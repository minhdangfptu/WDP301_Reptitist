// backend/src/routes/productReportRoute.js
const express = require('express');
const router = express.Router();
const { createProductReport } = require('../controllers/productReportController');
const { authUserIdOnly } = require('../middleware/authMiddleware');

// API cho user gửi báo cáo sản phẩm
router.post('/', authUserIdOnly, createProductReport);

module.exports = router;