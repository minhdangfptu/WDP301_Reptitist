const express = require('express');
const router = express.Router();

// PayOS Controller functions (remove handlePayOSWebhook)
const { 
    createPayOSPayment,
    checkPayOSPaymentStatus,
    cancelPayOSPayment,
    getTransactionHistory,
    refundTransaction,
    filterTransactionHistory 
} = require('../controllers/transactionController');

const {
    authMiddleware,
    authUserIdOnly
} = require('../middleware/authMiddleware');
const validateObjectId = require('../middleware/validateObjectId');
const { ensureOwnUserData } = require('../middleware/ensureOwner');

// PayOS Payment Routes
router.get(
    '/payos/create',
    authMiddleware,
    createPayOSPayment
);

// Check payment status (polling method)
router.get(
    '/payos/status/:orderCode',
    authMiddleware,
    checkPayOSPaymentStatus
);

// Cancel payment
router.post(
    '/payos/cancel/:orderCode',
    authMiddleware,
    cancelPayOSPayment
);

// Transaction History Routes
router.get(
    '/history',
    authUserIdOnly,
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

// Refund Route
router.post(
    '/refund/:transaction_id',
    authMiddleware,
    validateObjectId,
    refundTransaction
);

module.exports = router;