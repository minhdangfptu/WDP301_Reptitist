const mongoose = require('mongoose');

const libraryContentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  image_urls: { type: [String], default: [] },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topic_id: { type: mongoose.Schema.Types.ObjectId, ref: 'LibraryTopic', required: true  },
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'LibraryCategory', required: true  }
}, { collection: 'library_contents', timestamps: true });

module.exports = mongoose.model('LibraryContent', libraryContentSchema);
console.log('LibraryContent model loaded');