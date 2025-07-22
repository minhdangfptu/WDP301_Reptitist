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
    enum: ['pending', 'completed', 'failed', 'refunded', 'cancelled'],
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

  // --- PayOS specific fields ---
  payos_order_code: {
    type: Number,
    unique: true,
    required: true
  },
  payos_payment_link_id: {
    type: String
  },
  payos_response_code: {
    type: String
  },
  payos_response_desc: {
    type: String
  },
  payos_transaction_id: {
    type: String
  },
  
  // --- Response data ---
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

// --- Indexes for better performance ---
transactionSchema.index({ user_id: 1, createdAt: -1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ payos_order_code: 1 });

// --- Static methods ---
transactionSchema.statics.findByOrderCode = function(orderCode) {
  return this.findOne({ payos_order_code: orderCode });
};

transactionSchema.statics.getUserTransactions = function(userId, limit = 10) {
  return this.find({ user_id: userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('amount status description createdAt transaction_type payos_order_code');
};

module.exports = mongoose.model('Transaction', transactionSchema);