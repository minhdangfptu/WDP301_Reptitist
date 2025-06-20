const mongoose = require('mongoose');

const aiRecommendationSchema = new mongoose.Schema({
  user_reptile_id: { type: String, required: true },
  recommendation_summary: { type: String },
  recommendation_details: [{ type: String }],
  score: { type: Number },
  ai_history_id: { type: mongoose.Schema.Types.ObjectId, ref: 'AIHistory', required: true },
  generated_at: { type: Date, default: Date.now }
}, { collection: 'ai_recommendation' });

module.exports = mongoose.model('AIRecommendation', aiRecommendationSchema);
console.log('AIRecommendation model loaded');