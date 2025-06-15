const mongoose = require('mongoose');

// Check if the model already exists before creating it
const Role = mongoose.models.Role || mongoose.model('Role', new mongoose.Schema({
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
}));

module.exports = Role;
console.log('Role model loaded');