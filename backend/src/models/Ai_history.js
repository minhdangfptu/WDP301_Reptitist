const mongoose = require('mongoose');

const aiHistorySchema = new mongoose.Schema({
  DialogContent: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
}, { collection: 'ai_history' });

module.exports = mongoose.model('AIHistory', aiHistorySchema);
console.log('AIHistory model loaded');