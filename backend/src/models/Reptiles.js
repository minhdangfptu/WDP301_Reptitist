const mongoose = require('mongoose');

// Sub-schema: reptile_category
const reptileCategorySchema = new mongoose.Schema({
  class: { type: String, required: true },
  order: { type: String, required: true },
  family: { type: String, required: true }
}, { _id: false });

// Sub-schema: adult_size
const sizeSchema = new mongoose.Schema({
  min: { type: Number, required: true },
  max: { type: Number, required: true }
}, { _id: false });

// Sub-schema: temperature_range
const temperatureRangeSchema = new mongoose.Schema({
  day: { type: [Number], required: true },
  night: { type: [Number], required: true }
}, { _id: false });

// Sub-schema: disease
const diseaseSchema = new mongoose.Schema({
  day: { type: String, required: true },
  prevention: { type: String, required: true },
  treatment: { type: String, required: true }
}, { _id: false });

// Main schema: reptiles
const reptileSchema = new mongoose.Schema({
  specific_name: { type: String, required: true },           
  common_name: { type: String, required: true },
  reptile_category: reptileCategorySchema,
  breed_or_morph: { type: String },
  lifespan_years: { type: Number, required: true },
  adult_size: sizeSchema,
  natural_habitat: { type: String },
  activity_pattern: { type: String },
  temperature_range: temperatureRangeSchema,
  humidity_range_percent: { type: [Number], required: true },
  uvb_required: { type: Boolean, required: true },
  reptile_description: { type: String },
  diet: { type: String },
  recommended_foods: { type: [String] },
  prohibited_foods: { type: [String] },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  disease: diseaseSchema,
  reptile_imageurl: {
    type: String,
    default: null,
    // Support both file paths and base64 data
    validate: {
      validator: function(v) {
        if (!v) return true; // Allow null/empty values
        
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
}, {
  collection: 'reptiles',
  timestamps: true
});

module.exports = mongoose.model('Reptile', reptileSchema);
console.log('Reptile model loaded');