const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  order_items: {
    type: [mongoose.Schema.Types.Mixed], // hoặc bạn có thể định nghĩa chi tiết từng item
    required: true
  },
  order_status: {
    type: String,
    enum: ['ordered', 'shipped', 'delivered', 'cancelled'], // tùy theo hệ thống
    default: 'ordered'
  },
  order_date: {
    type: Date,
    default: Date.now
  },
  order_price: {
    type: Number,
    required: true
  },
  customer_id: {
    type: String,
    required: true
  },
  shop_id: {
    type: String,
    required: true
  }
}, {
  collection: 'orders' 
});

module.exports = mongoose.model('Order', orderSchema);
console.log('Order model loaded');