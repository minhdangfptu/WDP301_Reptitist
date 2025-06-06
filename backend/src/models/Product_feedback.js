const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, min: 0, max: 5, required: true },
  comment: { type: String },
  
}, {
  collection: 'product_feedbacks',
  timestamps: true
});

const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback;
console.log('Product feedback model loaded');