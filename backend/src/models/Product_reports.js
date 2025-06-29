// backend/src/models/Product_reports.js
const mongoose = require('mongoose');

const productReportSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  reporter_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  shop_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reason: {
    type: String,
    enum: ['spam', 'inappropriate', 'fake', 'violence', 'copyright', 'other'],
    required: true
  },
  description: {
    type: String,
    maxlength: 500
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  admin_note: {
    type: String,
    maxlength: 500
  },
  resolved_at: {
    type: Date
  },
  resolved_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  collection: 'product_reports',
  timestamps: true
});

// Index để tăng tốc độ query
productReportSchema.index({ product_id: 1, reporter_id: 1 }, { unique: true });
productReportSchema.index({ status: 1 });
productReportSchema.index({ shop_id: 1 });

module.exports = mongoose.model('ProductReport', productReportSchema);
console.log('ProductReport model loaded');