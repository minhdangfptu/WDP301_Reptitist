const mongoose = require('mongoose');

const aiHistorySchema = new mongoose.Schema({
  DialogContent: { type: String, required: true },
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now }
}, { collection: 'ai_history' });

module.exports = mongoose.model('AIHistory', aiHistorySchema);
