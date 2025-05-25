const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  product_name: { type: String, required: true },
  product_price: { type: Number, required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product_description: { type: String },
  product_imageurl: { type: [String], default: [] },
  product_category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductCategory', required: true },
  product_quantity: { type: Number, default: 0 },
  product_status: { type: String, enum: ['available', 'pending', 'not_available'], default: 'pending' },
  create_at: { type: Date, default: Date.now },

  average_rating: { type: Number, min: 0, max: 5, default: 0 }
}, {
  collection: 'products'
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
console.log('Product model loaded');