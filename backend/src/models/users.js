const mongoose = require('mongoose');

const usernameRegex = /^[a-zA-Z0-9]{3,30}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true,'User name is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [30, 'Username must be at most 30 characters long'],
    match: [usernameRegex, 'Username must be alphanumeric and between 3 to 30 characters long'],
  },
  email: {
    type: String,
    required: [true,'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        return emailRegex.test(v);
      },
      message: props => `${props.value} is not a valid email!`
    }
  },
  password_hashed: {
    type: String,
    required: [true,'Password is required'],
  },
  refresh_tokens: {
    type: [
      {
        hashed_token:{
          type: String,
          required: true,
        },
        created_at: {
          type: Date,
          default: Date.now,
        },
        expires_at: {
          type: Date,
          required: true,
        },
        user_agent: {
          type: String,
          default: '',
        },
        ip_address: {
          type: String,
          default: '',
        },
        is_revoked: {
          type: Boolean,
          default: false,
        },
      }
    ],
    default: [],
  },
  role_id:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    required: true
  },
  phone_number: {
    type: String,
    trim: true,
    default: '',
  },
  address: {
    type: String,
    default: '',
  },
  isActive: {
    type: Boolean,
    default: true
  },
  wallet: {
    balance: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      default: 'VND'
    },
    last_updated: {
      type: Date,
      default: Date.now
    }
  },
  account_type: {
    type: {
      type: String,
      default: 'customer',  
      enum: ['customer','shop']    
    },
    level: {
      type: String,
      default: 'normal',
      enum: ['normal', 'premium']
    },
    activated_at: {
      type: Date,
      default: null,
    },
    expires_at: {
      type: Date,
      default: null,
    }
  },
  user_reptile_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserReptile'
  },
  user_imageurl: {
    type: String, 
    default: ''
  },
  fullname: {
    type: String,
    trim: true,
    default: '',
  }
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  },
  collection: 'users'
});

// Check if the model exists before creating it
module.exports = mongoose.models.User || mongoose.model('User', userSchema);
console.log('User model loaded');