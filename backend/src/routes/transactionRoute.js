const express = require('express');
const { createTransaction, getTransactions, getAllTransactions, deleteTransaction, updateTransaction } = require('../controllers/transactionController');
const { authMiddleware } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

console.log('Transaction route file loaded');

// Protected route for creating a transaction
router.post('/', authMiddleware, (req, res, next) => { console.log('POST /transactions hit'); next(); }, createTransaction);

// Protected route for getting user transactions
router.get('/', authMiddleware, (req, res, next) => { console.log('GET /transactions hit'); next(); }, getTransactions);

// Protected route for getting all transactions (admin only)
router.get('/all', authMiddleware, roleMiddleware('admin'), getAllTransactions);

router.delete('/:id', authMiddleware, roleMiddleware('admin'), deleteTransaction);
router.put('/:id', authMiddleware, roleMiddleware('admin'), updateTransaction);

module.exports = router; 