const mongoose = require('mongoose');

const libraryContentSchema = new mongoose.Schema({
  library_content_id: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  image_urls: { type: [String], default: [] },
  created_at: { type: Date, default: Date.now },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topic_category_id: { type: String, required: true },
  category_content_id: { type: String, required: true }
}, { collection: 'library_content' });

module.exports = mongoose.model('LibraryContent', libraryContentSchema);
console.log('LibraryContent model loaded');