const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  }
}, { _id: false }); // không tạo _id cho từng cart item con

const cartSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cart_items: {
    type: [cartItemSchema],
    default: []
  }
}, {
  collection: 'carts',
  timestamps: true
});

module.exports = mongoose.model('Cart', cartSchema);
