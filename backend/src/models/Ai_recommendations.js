const mongoose = require('mongoose');

const aiRecommendationSchema = new mongoose.Schema({
  user_reptile_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserReptile',
    required: true
  },
  recommendation_summary: {
    type: String,
    required: true
  },
  recommendation_detail_habitat: {
    type: String,
    default: ''
  },
  recommendation_detail_behavior: {
    type: String,
    default: ''
  },
  recommendation_detail_treatment: {
    type: String,
    default: ''
  },
  recommendation_detail_nutrition: {
    type: String,
    default: ''
  },
}, {
  collection: 'ai_recommendations',
  timestamps: true
});

module.exports = mongoose.model('AIRecommendation', aiRecommendationSchema);
console.log('AIRecommendation model loaded');
