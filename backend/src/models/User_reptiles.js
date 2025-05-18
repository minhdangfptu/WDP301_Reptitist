const mongoose = require('mongoose');

const userReptileSchema = new mongoose.Schema({
  user_reptile_id: {
    type: Number,
    required: true,
    unique: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reptile_name: {
    type: String,
    required: true
  },
  reptile_species: {
    type: String,
    required: true
  },
  name: {
    type: String
  },
  description: {
    type: String
  },
  age: {
    type: Number
  },
  follow_since: {
    type: Date
  },
  current_weight: {
    type: Number
  },
  weight_history: {
    type: [
      {
        date: Date,
        weight: Number
      }
    ],
    default: []
  },
  health_score: {
    type: Number,
    min: 0,
    max: 10
  },
  health_change: {
    type: String
  },
  sleeping_status: {
    type: mongoose.Schema.Types.Mixed // nếu cấu trúc phức tạp, chưa rõ
  },
  sleeping_history: {
    type: [
      {
        date: Date,
        status: String // hoặc bạn có thể chi tiết hơn tùy dữ liệu
      }
    ],
    default: []
  },
  sleeping_feedback: {
    type: String
  },
  disease_history: {
    type: [
      {
        date: Date,
        disease_name: String,
        notes: String
      }
    ],
    default: []
  },
  treatment_schedule: {
    type: [
      {
        date: Date,
        treatment: String,
        notes: String
      }
    ],
    default: []
  }
}, {
  collection: 'user_reptiles',
  timestamps: true
});

module.exports = mongoose.model('UserReptile', userReptileSchema);
console.log('UserReptile model loaded');