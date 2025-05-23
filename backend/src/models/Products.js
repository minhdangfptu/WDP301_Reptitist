const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  
  product_name: {
    type: String,
    required: true
  },
  product_price: {
    type: Number,
    required: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true
  },
  feedback: {
    type: String
  },
  rating: {
    type: Number,
    min: 0,
    max: 5
  },
  product_description: {
    type: String
  },
  product_images: {
    type: [String],
    default: []
  },
  product_category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductCategory', 
    required: true
  },
  product_quantity: {
    type: Number,
    default: 0
  },
  create_at: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'products' 
});

module.exports = mongoose.model('Product', productSchema);
console.log('Product model loaded');