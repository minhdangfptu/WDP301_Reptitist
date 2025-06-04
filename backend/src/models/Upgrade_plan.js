const mongoose = require('mongoose');

const upgradePlanSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true 
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String
  },
  duration: {
    type: Number,
    required: true,
    min: 0 
  }
}, {
  collection: 'upgrade_plan',
  timestamps: true
});

module.exports = mongoose.model('UpgradePlan', upgradePlanSchema);
console.log('UpgradePlan model loaded');
