const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, min: 0, max: 5, required: true },
  comment: { type: String },
  created_at: { type: Date, default: Date.now }
});

const productSchema = new mongoose.Schema({
  product_name: { type: String, required: true },
  product_price: { type: Number, required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product_description: { type: String },
  product_images: { type: [String], default: [] },
  product_category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductCategory', required: true },
  product_quantity: { type: Number, default: 0 },
  product_status: { type: String, enum: ['available', 'pending', 'not_available'], default: 'pending' },
  create_at: { type: Date, default: Date.now },

  feedbacks: [feedbackSchema],   
  average_rating: { type: Number, min: 0, max: 5, default: 0 }
}, {
  collection: 'products'
});

module.exports = mongoose.model('Product', productSchema);
console.log('Product model loaded');
