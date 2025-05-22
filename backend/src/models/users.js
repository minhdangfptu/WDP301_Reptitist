const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  user_id: {
    type: Number,
    unique: true,
    required: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password_hashed: {
    type: String,
    required: true
  },
  refresh_token: {
    type: String
  },
  phone_number: {
    type: String,
    trim: true
  },
  address: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  wallet: {
    type: mongoose.Schema.Types.Mixed 
  },
  account_type: {
    type: mongoose.Schema.Types.Mixed 
  },
  user_reptile_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserReptile'
  },
  transaction_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  },
  cart_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cart'
  }
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  },
  collection: 'users'
});

module.exports = mongoose.model('User', userSchema);
console.log('User model loaded');