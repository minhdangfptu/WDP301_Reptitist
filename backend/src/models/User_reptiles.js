const mongoose = require('mongoose');

// Sub-schema: weight_history
const weightHistorySchema = new mongoose.Schema({
  date: { type: Date, required: true },
  weight: { type: Number, required: true }
}, { _id: false });

// Sub-schema: sleeping_status
const sleepingStatusSchema = new mongoose.Schema({
  status: { type: String, required: true },
  order: { type: String, required: true }
}, { _id: false });

// Sub-schema: sleeping_history
const sleepingHistorySchema = new mongoose.Schema({
  date: { type: Date, required: true },
  hours: { type: Number, required: true }
}, { _id: false });

// Sub-schema: disease_history
const diseaseHistorySchema = new mongoose.Schema({
  disease: { type: String, required: true },
  diagnosed_at: { type: Date, required: true },
  treated: { type: Boolean, required: true },
  notes: { type: String }
}, { _id: false });

// Sub-schema: treatment_schedule
const treatmentScheduleSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  treatment: { type: String, required: true },
  notes: { type: String }
}, { _id: false });

// Main schema: user_reptiles
const userReptileSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reptile_name: { type: String, required: true },
  reptile_species: { type: String, required: true },
  name: { type: String },
  description: { type: String },
  age: { type: Number },
  follow_since: { type: Date },
  current_weight: { type: Number },
  health_score: { type: Number, min: 0, max: 10 },
  health_change: { type: String },
  weight_history: {
    type: [weightHistorySchema],
    default: []
  },
  sleeping_status: sleepingStatusSchema,
  sleeping_history: {
    type: [sleepingHistorySchema],
    default: []
  },
  sleeping_feedback: { type: String },
  disease_history: {
    type: [diseaseHistorySchema],
    default: []
  },
  treatment_schedule: {
    type: [treatmentScheduleSchema],
    default: []
  }
}, {
  collection: 'user_reptiles',
  timestamps: true
});

module.exports = mongoose.model('UserReptile', userReptileSchema);
console.log('UserReptile model loaded');
