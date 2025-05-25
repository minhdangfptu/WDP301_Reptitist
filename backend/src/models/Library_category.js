const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  
  category_content: { type: String, required: true },
  category_description: { type: String },
  category_imageurl: { type: String }
}, { collection: 'library_categories' });

module.exports = mongoose.model('LibraryCategory', categorySchema);
console.log('LibraryCategory model loaded');