const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const Product = require('../models/Products');
const User = require('../models/users');

router.post('/shop-complain', async (req, res) => {
  const { name, email, productId, reason, description } = req.body;
  try {
    // Lấy email shop từ productId
    let shopEmail = email;
    let shopName = name;
    let productName = '';
    let productImage = '';
    if (productId) {
      const product = await Product.findById(productId).populate('user_id', 'email username');
      if (product && product.user_id && product.user_id.email) {
        shopEmail = product.user_id.email;
        shopName = product.user_id.username || name;
      }
      if (product) {
        productName = product.product_name || '';
        productImage = (product.product_imageurl && product.product_imageurl.length > 0) ? product.product_imageurl[0] : '';
      }
    }
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      },
      tls: {
        rejectUnauthorized: false
      }
    });
    console.log('Bắt đầu gửi mail khiếu nại...');
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f9f9f9; border-radius: 8px;">
        <div style="background: #fff; border-radius: 8px; box-shadow: 0 2px 8px #eee; padding: 24px;">
          <h2 style="color: #e67e22; text-align: center; margin-bottom: 24px;">📢 ĐƠN KHIẾU NẠI SẢN PHẨM</h2>
          <table style="width: 100%; font-size: 15px; margin-bottom: 20px;">
            <tr><td style="font-weight:bold; width: 140px;">Tên shop:</td><td>${shopName}</td></tr>
            <tr><td style="font-weight:bold;">Email:</td><td>${shopEmail}</td></tr>
            <tr><td style="font-weight:bold;">Mã sản phẩm:</td><td>${productId}</td></tr>
            <tr><td style="font-weight:bold;">Tên sản phẩm:</td><td>${productName}</td></tr>
            <tr><td style="font-weight:bold;">Lý do khiếu nại:</td><td>${reason}</td></tr>
          </table>
          ${productImage ? `<div style=\"text-align:center; margin-bottom:20px;\"><img src=\"${productImage}\" alt=\"Hình ảnh sản phẩm\" style=\"max-width:180px; border-radius:8px; border:1px solid #eee;\" /></div>` : ''}
          <div style="margin-bottom: 20px;">
            <div style="font-weight:bold; margin-bottom: 6px;">Mô tả chi tiết:</div>
            <div style="background: #f8f8f8; border-radius: 6px; padding: 12px; border: 1px solid #eee; color: #333;">${description || '<i>Không có</i>'}</div>
          </div>
          <div style="text-align:right; color:#888; font-size:13px; margin-top: 24px;">
            <i>Thời gian gửi: ${new Date().toLocaleString('vi-VN')}</i>
          </div>
        </div>
        <div style="text-align:center; color:#aaa; font-size:12px; margin-top: 18px;">Email này được gửi tự động từ hệ thống Reptitist</div>
      </div>
    `;
    const info = await transporter.sendMail({
      from: shopEmail,
      to: process.env.EMAIL_USER,
      subject: `[REPTITIST] Khiếu nại quyết định về sản phẩm #${productId}`,
      text: `Tên shop: ${shopName}\nEmail: ${shopEmail}\nMã sản phẩm: ${productId}\nLý do khiếu nại: ${reason}\nMô tả chi tiết: ${description}\nThời gian gửi: ${new Date().toLocaleString('vi-VN')}`,
      html
    });
    console.log('Gửi mail thành công:', info.response);
    res.json({ success: true });
  } catch (err) {
    console.error('Lỗi gửi mail:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router; 