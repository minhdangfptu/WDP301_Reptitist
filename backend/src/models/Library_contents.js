const mongoose = require('mongoose');

const libraryContentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  image_urls: { type: [String], default: [] },
  created_at: { type: Date, default: Date.now },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topic_category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'TopicCategory', required: true  },
  category_content_id: { type: mongoose.Schema.Types.ObjectId, ref: 'LibraryCategories', required: true  }
}, { collection: 'library_contents' });

module.exports = mongoose.models.LibraryContent || mongoose.model('LibraryContent', libraryContentSchema);

console.log('LibraryContent model loaded');