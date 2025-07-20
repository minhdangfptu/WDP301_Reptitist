const express = require('express');
const router = express.Router();

const { 
    createPaymentURL,
    handlePaymentReturn,
    getTransactionHistory,
    refundTransaction,
    filterTransactionHistory,
    // Admin functions
    getAllTransactions,
    updateTransaction,
    deleteTransaction,
    getTransactionStats
} = require('../controllers/transactionController');

const {
    authMiddleware,
    authUserIdOnly
} = require('../middleware/authMiddleware');
const validateObjectId = require('../middleware/validateObjectId');
const { ensureOwnUserData } = require('../middleware/ensureOwner');
const roleMiddleware = require('../middleware/roleMiddleware');

// ===== USER ROUTES =====
router.get(
    '/create',
    authMiddleware,
    createPaymentURL
);

router.get(
    '/vnpay_return',
    handlePaymentReturn
);

router.get(
    '/return',
    handlePaymentReturn
);

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

router.post(
    '/refund/:transaction_id',
    authMiddleware,
    validateObjectId,
    refundTransaction
);

// ===== ADMIN ROUTES =====

// Lấy tất cả giao dịch (admin only)
router.get(
    '/all',
    authMiddleware,
    roleMiddleware('admin'),
    getAllTransactions
);

// Thống kê giao dịch (admin only)
router.get(
    '/stats',
    authMiddleware,
    roleMiddleware('admin'),
    getTransactionStats
);

// Cập nhật giao dịch (admin only)
router.put(
    '/admin/:id',
    authMiddleware,
    roleMiddleware('admin'),
    validateObjectId,
    updateTransaction
);

// Xóa giao dịch (admin only)
router.delete(
    '/admin/:id',
    authMiddleware,
    roleMiddleware('admin'),
    validateObjectId,
    deleteTransaction
);

module.exports = router;