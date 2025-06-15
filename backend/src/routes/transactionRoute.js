const express = require('express');
const { createTransaction, getTransactions } = require('../controllers/transactionController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

console.log('Transaction route file loaded');

// Protected route for creating a transaction
router.post('/', authMiddleware, (req, res, next) => { console.log('POST /transactions hit'); next(); }, createTransaction);

// Protected route for getting user transactions
router.get('/', authMiddleware, (req, res, next) => { console.log('GET /transactions hit'); next(); }, getTransactions);

module.exports = router; 