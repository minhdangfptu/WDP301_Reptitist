const mongoose = require('mongoose');

const productCategorySchema = new mongoose.Schema({
  product_category_id: {
    type: String,
    required: true,
    unique: true 
  },
  product_category_name: {
    type: String,
    required: true
  },
  product_category_imageUrl: {
    type: String,
    required: true
  },
}, {
  collection: 'product_categories'
});

module.exports = mongoose.model('ProductCategory', productCategorySchema);
console.log('ProductCategory model loaded');