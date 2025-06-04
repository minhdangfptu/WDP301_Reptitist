const mongoose = require('mongoose');

// Schema cho cart_items (embedded trong carts)
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
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0
  }
}); 

// Schema cho carts
const cartSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cart_items: {
    type: [cartItemSchema], 
    default: []
  },
  
}, {
  collection: 'carts',
  timestamps: true
});

module.exports = mongoose.model('Cart', cartSchema);
console.log('Cart model loaded');
