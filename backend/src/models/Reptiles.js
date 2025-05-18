const mongoose = require('mongoose');

const reptileSchema = new mongoose.Schema({
  reptile_id: {
    type: Number,
    required: true,
    unique: true
  },
  scientific_name: {
    type: String,
    required: true
  },
  common_name: {
    type: String,
    required: true
  },
  reptile_category: {
    type: mongoose.Schema.Types.Mixed, // Nếu chưa rõ cấu trúc chi tiết
    default: {}
  },
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