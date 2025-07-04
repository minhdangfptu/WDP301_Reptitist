const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true
  },
  net_amount: {
    type: Number
    // Không required – sẽ tự động tính nếu chưa có
  },
  fee: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    default: 'VND'
  },
  transaction_type: {
    type: String,
    required: true // e.g., 'payment', 'refund'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    required: true
  },
  description: {
    type: String
  },
  items: {
    type: String,
    default: ''
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  is_test: {
    type: Boolean,
    default: false
  },
  refund_transaction_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction',
    default: null
  },
  transaction_date: {
    type: Date,
    default: Date.now
  },

  // --- VNPay specific fields ---
  vnp_txn_ref: {
    type: String,
    required: true,
    unique: true
  },
  vnp_response_code: {
    type: String
  },
  vnp_transaction_no: {
    type: String
  },
  raw_response: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true,
  collection: 'transactions'
});

// --- Auto-calculate net_amount ---
transactionSchema.pre('save', function (next) {
  if (this.net_amount === undefined || this.net_amount === null) {
    this.net_amount = this.amount - (this.fee || 0);
  }
  next();
});

module.exports = mongoose.model('Transaction', transactionSchema);
