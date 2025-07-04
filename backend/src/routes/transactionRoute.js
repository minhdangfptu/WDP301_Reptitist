const express = require('express');
const router = express.Router();

const { createPaymentURL,
    handlePaymentReturn,
    getTransactionHistory,
    refundTransaction,
    filterTransactionHistory,
    getAllTransactions,
    getTransactionById,
    updateTransaction,
    deleteTransaction } = require('../controllers/transactionController');

const {
    authMiddleware,
    authUserIdOnly
} = require('../middleware/authMiddleware');
const validateObjectId = require('../middleware/validateObjectId');
const { ensureOwnUserData } = require('../middleware/ensureOwner');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get(
    '/create',
    authMiddleware,
    createPaymentURL
);
router.get(
    '/return',
    handlePaymentReturn
);
router.get(
    '/history/:userId',
    authUserIdOnly,
    validateObjectId,
    ensureOwnUserData,
    getTransactionHistory
);
router.get(
    '/history/filter/:userId',
    authUserIdOnly,
    validateObjectId,
    ensureOwnUserData,
    filterTransactionHistory
);
router.get(
    '/all',
    authMiddleware,
    roleMiddleware('admin'),
    getAllTransactions
);
router.get(
    '/:id',
    authMiddleware,
    roleMiddleware('admin'),
    validateObjectId,
    getTransactionById
);
router.put(
    '/:id',
    authMiddleware,
    roleMiddleware('admin'),
    validateObjectId,
    updateTransaction
);
router.delete(
    '/:id',
    authMiddleware,
    roleMiddleware('admin'),
    validateObjectId,
    deleteTransaction
);
router.post(
    '/refund/:transaction_id',
    authMiddleware,
    validateObjectId,
    refundTransaction
);

module.exports = router;
