const mongoose = require('mongoose');

// Sub-schema: weight_history
const weightHistorySchema = new mongoose.Schema({
  date: { type: Date, required: true },
  weight: { type: Number, required: true }
}, { _id: false });

// Sub-schema: sleeping_status
const sleepingStatusSchema = new mongoose.Schema({
  status: { type: String, required: true },
  date: { type: Date, required: true }
}, { _id: false });

// Sub-schema: sleeping_history
const sleepingHistorySchema = new mongoose.Schema({
  date: { type: Date, required: true },
  hours: { type: Number, required: true }
}, { _id: false });

// Sub-schema: treatment_history
const treatmentHistorySchema = new mongoose.Schema({
  disease: { type: String, required: true },
  treatment_date: { type: Date, required: true },
  next_treatment_date: { type: Date },
  doctor_feedback: { type: String },
  treatment_medicine: { type: String },
  note: { type: String }
}, { _id: false });

// Sub-schema: nutrition_history
const nutritionHistorySchema = new mongoose.Schema({
  created_at: { type: Date, required: true },
  updated_at: { type: Date, required: true },
  food_items: { type: String, required: true },
  food_quantity: { type: String },
  is_fasting: { type: Boolean, default: false },
  feces_condition: { type: String }
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
  user_reptile_imageurl: { 
    type: String, 
    default: '',
    validate: {
      validator: function(v) {
        if (!v) return true; // Allow empty values
        
        // If it's a base64 image string
        if (v.startsWith('data:image/')) {
          // Basic validation for base64 image format
          const base64Regex = /^data:image\/(jpeg|jpg|png|gif|webp);base64,/;
          return base64Regex.test(v);
        }
        
        // If it's a regular file path/URL, allow it
        return typeof v === 'string';
      },
      message: 'Invalid image format. Must be a valid base64 image or file path.'
    }
  },
  age: { type: Number },
  follow_since: { type: Date },
  current_weight: { type: Number },

  weight_history: {
    type: [weightHistorySchema],
    default: []
  },
  sleeping_status: [sleepingStatusSchema],
  sleeping_history: {
    type: [sleepingHistorySchema],
    default: []
  },

  treatment_history: [treatmentHistorySchema],
  nutrition_history: [nutritionHistorySchema]

}, {
  collection: 'user_reptiles',
  timestamps: true
});

module.exports = mongoose.model('UserReptile', userReptileSchema);
console.log('UserReptile model loaded');