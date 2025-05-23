const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  
  amount: {
    type: Number,
    required: true
  },
  net_amount: {
    type: Number,
    required: true
  },
  fee: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    default: 'VND'
  },
  payment_type: {
    type: String,
    required: true
  },
  transaction_type: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    required: true
  },
  description: {
    type: String
  },
  locale: {
    type: String,
    default: 'vi'
  },
  is_test: {
    type: Boolean,
    default: false
  },
  items: {
    type: String
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  refund_transaction_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction',
    default: null
  },
  transaction_date: {
    type: Date,
    required: true
  }
}, {
  timestamps: true, 
  collection: 'transactions'
});

module.exports = mongoose.model('Transaction', transactionSchema);
