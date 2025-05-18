const mongoose = require('mongoose');

const aiRecommendationSchema = new mongoose.Schema({
  user_reptile_id: { type: String, required: true },
  sleeping_rcm: { type: String },
  environment_rcm: { type: String },
  nutrition_rcm: { type: String },
  disease_rcm: { type: String },
  generated_at: { type: Date, default: Date.now }
}, { collection: 'ai_recommendation' });

module.exports = mongoose.model('AIRecommendation', aiRecommendationSchema);
console.log('AIRecommendation model loaded');