const express = require('express');
const router = express.Router();

const { createPaymentURL,
    handlePaymentReturn,
    getTransactionHistory,
    refundTransaction,
    filterTransactionHistory } = require('../controllers/transactionController');

const {
    authMiddleware,
    authUserIdOnly
} = require('../middleware/authMiddleware');
const validateObjectId = require('../middleware/validateObjectId');
const { ensureOwnUserData } = require('../middleware/ensureOwner');
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
router.post(
    '/refund/:transaction_id',
    authMiddleware,
    validateObjectId,
    refundTransaction
);

module.exports = router;
