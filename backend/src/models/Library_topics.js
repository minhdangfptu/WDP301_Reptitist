const mongoose = require('mongoose');

const topicCategorySchema = new mongoose.Schema({
  topic_title: { type: String, required: true },
  topic_description: { type: String },
  topic_imageurl: { type: [String], default: [] },
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'LibraryCategory' } 
}, {
  collection: 'library_topics' 
});

// const expertTopicCategorySchema = new mongoose.Schema({
//   topic_title: { type: String, required: true },
//   topic_description: { type: String },
//   topic_imageurl: { type: [String], default: [] },
//   category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'LibraryCategory' }
// }, {
//   collection: 'library_expert_topics'
// });

module.exports = mongoose.models.LibraryTopic || mongoose.model('LibraryTopic', topicCategorySchema);
console.log('LibraryTopic model loaded');
// module.exports.LibraryExpertTopic = mongoose.models.LibraryExpertTopic || mongoose.model('LibraryExpertTopic', expertTopicCategorySchema);
