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
  collection: 'roles' // Tên collection trong MongoDB
});

module.exports = mongoose.model('Role', roleSchema);
console.log('Role model loaded');