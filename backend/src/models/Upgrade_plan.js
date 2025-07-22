// models/Upgrade_plan.js (hoặc tên file model của bạn)
const mongoose = require('mongoose');

const upgradePlanSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  price: { type: Number, required: true }, // Giá gốc (có thể là giá yearly hoặc monthly, tùy quy ước của bạn)
  description: { type: String },
  duration: { type: Number, required: true }, // 1 cho tháng, 12 cho năm
  contacts: { type: String },
  isPopular: { type: Boolean, default: false },
  isFree: { type: Boolean, default: false },
  originalPrice: { type: Number }, // Giá gốc gạch ngang (nếu có khuyến mãi)
  // KHÔNG CÓ monthlyPrice VÀ yearlyPrice Ở ĐÂY NỮA
}, { timestamps: true });

module.exports = mongoose.model('UpgradePlan', upgradePlanSchema);