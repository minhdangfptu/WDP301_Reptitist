const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  category_id: {
    type: String,
    required: true,
    unique: true,
    default: () => new mongoose.Types.ObjectId().toHexString()
  },
  category_content: { type: String, required: true },
  category_description: { type: String },
  category_imageurl: { type: String }
},{ collection: 'library_categories' });

module.exports = mongoose.model('LibraryCategories', categorySchema);
