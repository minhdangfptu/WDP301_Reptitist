const mongoose = require('mongoose');

const reptileCategorySchema = new mongoose.Schema({
  class: { type: String, required: true },
  order: { type: String, required: true },
  family: { type: String, required: true },
}, { _id: false });

const reptileSchema = new mongoose.Schema({

  scientific_name: {
    type: String,
    required: true
  },
  common_name: {
    type: String,
    required: true
  },
  reptile_category: reptileCategorySchema,
  breed_or_morph: {
    type: String
  },
  reptile_description: {
    type: String
  },
  image_url: {
    type: String
  }
}, {
  collection: 'reptiles' // hoặc tùy tên collection bạn đặt
});

module.exports = mongoose.model('Reptile', reptileSchema);
console.log('Reptile model loaded');