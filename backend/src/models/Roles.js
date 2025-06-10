const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  role_name: {
    type: String,
    required: true,
    unique: true
  },
  role_description: {
    type: String
  },
  role_active: {
    type: Boolean,
    default: true
  }
}, {
  collection: 'roles'
});

// Check if model exists before creating
module.exports = mongoose.models.Role || mongoose.model('Role', roleSchema);
console.log('Role model loaded');