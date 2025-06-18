const Transaction = require('../models/Transactions');
const asyncHandler = require('express-async-handler');

// @desc    Create a new transaction
// @route   POST /api/transactions
// @access  Private
const createTransaction = asyncHandler(async (req, res) => {
  const { amount, net_amount, fee, currency, transaction_type, status, description, items, is_test, user_id } = req.body;

  // Get user ID from either request body or auth middleware
  const userId = user_id || req.user?.id;

  if (!amount || !transaction_type || !status || !userId) {
    res.status(400);
    throw new Error('Vui lòng điền đầy đủ các trường bắt buộc: amount, transaction_type, status, user_id.');
  }

  const transaction = await Transaction.create({
    amount,
    net_amount: net_amount || amount,
    fee: fee || 0,
    currency: currency || 'VND',
    transaction_type,
    status,
    description,
    items,
    user_id: userId,
    is_test: is_test || false,
    transaction_date: new Date()
  });

  if (transaction) {
    res.status(201).json({
      message: 'Giao dịch được tạo thành công',
      transaction,
    });
  } else {
    res.status(400);
    throw new Error('Dữ liệu giao dịch không hợp lệ');
  }
});

// @desc    Get user transactions
// @route   GET /api/transactions
// @access  Private
const getTransactions = asyncHandler(async (req, res) => {
  const { range } = req.query;
  const userId = req.user.id;

  let startDate;
  const now = new Date();

  switch (range) {
    case '7days':
      startDate = new Date(now.setDate(now.getDate() - 7));
      break;
    case '30days':
      startDate = new Date(now.setMonth(now.getMonth() - 1));
      break;
    case '90days':
      startDate = new Date(now.setMonth(now.getMonth() - 3));
      break;
    case '1year':
      startDate = new Date(now.setFullYear(now.getFullYear() - 1));
      break;
    default:
      startDate = new Date(0); // All time
  }

  const transactions = await Transaction.find({
    user_id: userId,
    transaction_date: { $gte: startDate }
  }).sort({ transaction_date: -1 });

  res.status(200).json({ transactions });
});

module.exports = {
  createTransaction,
  getTransactions,
}; 