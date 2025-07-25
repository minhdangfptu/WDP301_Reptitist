// backend/src/controllers/productReportController.js
const mongoose = require('mongoose');
const Product = require('../models/Products');
const ProductReport = require('../models/Product_reports');
const User = require('../models/users');
const Role = require('../models/Roles');

const createProductReport = async (req, res) => {
  try {
    const { product_id, reason, description } = req.body;
    const reporter_id = req.userId;

    console.log('Received payload:', { product_id, reason, description, reporter_id });

    if (!mongoose.Types.ObjectId.isValid(product_id)) {
      return res.status(400).json({ message: 'Invalid Product ID.' });
    }

    if (!['spam', 'inappropriate', 'fake', 'violence', 'copyright', 'other'].includes(reason)) {
      return res.status(400).json({ message: 'Lý do báo cáo không hợp lệ.' });
    }

    console.log('Fetching product with ID:', product_id);
    const product = await Product.findById(product_id);
    if (!product) {
      return res.status(404).json({ message: 'Sản phẩm không tồn tại.' });
    }
    console.log('Product found:', product);

    console.log('Checking existing report for:', { product_id, reporter_id });
    const existingReport = await ProductReport.findOne({ product_id, reporter_id });
    if (existingReport) {
      return res.status(200).json({ message: 'Bạn đã báo cáo sản phẩm này rồi.' });
    }

    const shop_id = product.user_id && mongoose.Types.ObjectId.isValid(product.user_id) 
      ? product.user_id 
      : null;
    console.log('Shop ID:', shop_id);
    if (shop_id && shop_id.toString() === reporter_id) {
      return res.status(403).json({ message: 'Bạn không thể báo cáo sản phẩm của chính mình.' });
    }
    // Fetch the user with role info
    const reporter = await User.findById(reporter_id).populate('role_id');
    if (!reporter) {
      return res.status(401).json({ message: 'Người dùng không tồn tại.' });
    }
    if (reporter.role_id && reporter.role_id.role_name === 'admin') {
      return res.status(403).json({ message: 'Admin không thể báo cáo sản phẩm.' });
    }

    const newReport = new ProductReport({
      product_id,
      reporter_id,
      shop_id,
      reason,
      description,
      status: 'pending'
    });

    console.log('Saving new report:', newReport);
    await newReport.save();

    res.status(201).json({ message: 'Báo cáo sản phẩm thành công.', report: newReport });
  } catch (error) {
    console.error('Error creating product report:', error);
    console.error('Error details:', error.message, error.stack);
    res.status(500).json({ 
      message: 'Lỗi server khi tạo báo cáo.', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};

module.exports = { createProductReport };