const mongoose = require('mongoose');

const aiHistorySchema = new mongoose.Schema({
  ai_input: [{ type: String, required: true }],
  ai_response: [{ type: String, required: true }],
  user_reptile_id: { type: mongoose.Schema.Types.ObjectId, ref: 'UserReptile', required: true },
  created_at: { type: Date, default: Date.now },
}, { collection: 'ai_history' });

module.exports = mongoose.model('AIHistory', aiHistorySchema);
console.log('AIHistory model loaded');