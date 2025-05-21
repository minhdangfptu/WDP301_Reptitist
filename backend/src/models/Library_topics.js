const mongoose = require('mongoose');

const topicCategorySchema = new mongoose.Schema({
  topic_title: { type: String, required: true },
  topic_description: { type: String },
  topic_imageurl: { type: [String], default: [] } 
}, {
  collection: 'library_topics' 
});

module.exports = mongoose.model('TopicCategory', topicCategorySchema);
console.log('TopicCategory model loaded');