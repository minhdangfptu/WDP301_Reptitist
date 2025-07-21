const PayOS = require('@payos/node');
const Transaction = require('../models/Transactions');
const moment = require('moment');
const User = require('../models/users');

// PayOS Configuration
const payOS = new PayOS(
  process.env.PAYOS_CLIENT_ID,
  process.env.PAYOS_API_KEY,
  process.env.PAYOS_CHECKSUM_KEY
);

// ✅ Tạo PayOS Payment
const createPayOSPayment = async (req, res) => {
  try {
    console.log('🚀 CREATE PAYOS PAYMENT - START');
    const { amount, user_id, items, description } = req.query;

    // Validate input
    if (!amount || !user_id) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin amount hoặc user_id'
      });
    }

    // Tạo unique order code
    const orderCode = parseInt(moment().format('YYMMDDHHmmss'));
    
    // Parse items
    let itemsList = [];
    try {
      if (items) {
        const parsedItems = typeof items === 'string' ? JSON.parse(items) : items;
        itemsList = [{
          name: parsedItems.plan_name || 'Premium Plan',
          quantity: 1,
          price: parseInt(amount)
        }];
      } else {
        itemsList = [{
          name: description || 'Premium Plan',
          quantity: 1,
          price: parseInt(amount)
        }];
      }
    } catch (error) {
      itemsList = [{
        name: description || 'Premium Plan',
        quantity: 1,
        price: parseInt(amount)
      }];
    }

    // PayOS Payment Data
    const paymentData = {
      orderCode: orderCode,
      amount: parseInt(amount),
      description: description?.substring(0, 25) || 'Premium Plan',
      items: itemsList,
      returnUrl: `${process.env.FRONTEND_URL}/payment/success?orderCode=${orderCode}`,
      cancelUrl: `${process.env.FRONTEND_URL}/payment/cancel?orderCode=${orderCode}`
    };

    console.log('📋 PayOS Payment Data:', paymentData);

    // Tạo payment link
    const paymentLinkRes = await payOS.createPaymentLink(paymentData);
    
    console.log('✅ PayOS Payment Link:', paymentLinkRes.checkoutUrl);

    // Lưu transaction vào database
    const transaction = await Transaction.create({
      amount: parseInt(amount),
      fee: 0,
      currency: 'VND',
      transaction_type: 'payment',
      status: 'pending',
      description: description || 'Thanh toán Premium',
      items: items || JSON.stringify(itemsList),
      user_id,
      payos_order_code: orderCode,
      payos_payment_link_id: paymentLinkRes.paymentLinkId
    });

    console.log('💾 Transaction saved:', transaction._id);

    // Trả về payment URL (không redirect)
    res.status(201).json({
      success: true,
      paymentUrl: paymentLinkRes.checkoutUrl,
      orderCode: orderCode,
      amount: parseInt(amount),
      description: paymentData.description
    });

  } catch (error) {
    console.error('❌ PayOS Payment Error:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể tạo link thanh toán',
      error: error.message
    });
  }
};

// ✅ Kiểm tra trạng thái thanh toán (Polling method)
const checkPayOSPaymentStatus = async (req, res) => {
  try {
    const { orderCode } = req.params;
    
    console.log('🔍 Checking PayOS status for:', orderCode);

    // Gọi PayOS API để lấy thông tin
    const paymentInfo = await payOS.getPaymentLinkInformation(parseInt(orderCode));
    
    console.log('📋 PayOS Status:', paymentInfo.status);
    
    // Tìm transaction trong database
    const transaction = await Transaction.findOne({ 
      payos_order_code: parseInt(orderCode) 
    });
    
    if (!transaction) {
      return res.status(404).json({ 
        success: false,
        error: 'Không tìm thấy giao dịch' 
      });
    }

    // Map PayOS status to our status
    let newStatus = transaction.status;
    let shouldUpdate = false;

    switch (paymentInfo.status) {
      case 'PAID':
        if (transaction.status !== 'completed') {
          newStatus = 'completed';
          shouldUpdate = true;
        }
        break;
      case 'CANCELLED':
        if (transaction.status !== 'cancelled') {
          newStatus = 'cancelled';
          shouldUpdate = true;
        }
        break;
      case 'EXPIRED':
        if (transaction.status !== 'failed') {
          newStatus = 'failed';
          shouldUpdate = true;
        }
        break;
      case 'PENDING':
      case 'PROCESSING':
        // Giữ nguyên pending
        break;
      default:
        console.log('⚠️ Unknown PayOS status:', paymentInfo.status);
    }

    if (shouldUpdate) {
      transaction.status = newStatus;
      transaction.payos_response_code = paymentInfo.status;
      transaction.payos_response_desc = `Status from PayOS: ${paymentInfo.status}`;
      transaction.payos_transaction_id = paymentInfo.id || null;
      transaction.raw_response = paymentInfo;
      await transaction.save();
      console.log(`✅ Transaction updated: ${newStatus}`);
      if (newStatus === 'completed') {
        try {
          let planType = 2; // Silver mặc định
          let planName = '';
          let period = 'monthly'; // mặc định
          if (transaction.items) {
            let itemsObj = {};
            try {
              itemsObj = typeof transaction.items === 'string' ? JSON.parse(transaction.items) : transaction.items;
            } catch (e) {}
            if (itemsObj && typeof itemsObj === 'object') {
              if (itemsObj.plan_name) planName = itemsObj.plan_name;
              if (itemsObj.period) period = itemsObj.period;
            }
          }
          if (!planName && transaction.description) {
            planName = transaction.description;
          }
          // Quy ước: Silver = 2, Gold = 3, Diamond = 4
          if (planName === 'Diamond') planType = 4;
          else if (planName === 'Gold') planType = 3;
          else if (planName === 'Silver') planType = 2;

          // Tính expires_at
          const now = new Date();
          let expiresAt = new Date(now);
          if (period === 'yearly') {
            expiresAt.setFullYear(expiresAt.getFullYear() + 1);
          } else {
            expiresAt.setMonth(expiresAt.getMonth() + 1);
          }

          await User.findByIdAndUpdate(transaction.user_id, {
            $set: {
              'account_type.type': planType,
              'account_type.activated_at': now,
              'account_type.expires_at': expiresAt
            }
          });
          console.log(`✅ User ${transaction.user_id} upgraded to account_type.type = ${planType}, expires at ${expiresAt}`);
        } catch (err) {
          console.error('❌ Error upgrading user account_type:', err);
        }
      }
    }

    // Trả về thông tin
    res.json({
      success: true,
      orderCode: parseInt(orderCode),
      status: newStatus,
      payosStatus: paymentInfo.status,
      amount: transaction.amount,
      description: transaction.description,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt
    });

  } catch (error) {
    console.error('❌ Check Status Error:', error);
    
    // Fallback: trả về thông tin từ database
    try {
      const transaction = await Transaction.findOne({ 
        payos_order_code: parseInt(req.params.orderCode) 
      });
      
      if (transaction) {
        return res.json({
          success: true,
          orderCode: parseInt(req.params.orderCode),
          status: transaction.status,
          payosStatus: 'API_ERROR',
          amount: transaction.amount,
          description: transaction.description,
          note: 'PayOS API không khả dụng, trả về từ database',
          createdAt: transaction.createdAt,
          updatedAt: transaction.updatedAt
        });
      }
    } catch (dbError) {
      console.error('Database fallback error:', dbError);
    }
    
    res.status(500).json({ 
      success: false,
      error: 'Không thể kiểm tra trạng thái thanh toán' 
    });
  }
};

// ✅ Hủy thanh toán
const cancelPayOSPayment = async (req, res) => {
  try {
    const { orderCode } = req.params;
    
    console.log('🚫 Canceling payment:', orderCode);
    
    // Gọi PayOS API để hủy
    const cancelResult = await payOS.cancelPaymentLink(parseInt(orderCode));
    
    // Cập nhật database
    const transaction = await Transaction.findOne({ 
      payos_order_code: parseInt(orderCode) 
    });
    
    if (transaction && transaction.status === 'pending') {
      transaction.status = 'cancelled';
      transaction.payos_response_code = 'CANCELLED';
      transaction.payos_response_desc = 'Hủy bởi người dùng';
      transaction.raw_response = cancelResult;
      await transaction.save();
      
      console.log('✅ Transaction cancelled:', transaction._id);
    }

    res.json({
      success: true,
      message: 'Đã hủy thanh toán thành công',
      orderCode: parseInt(orderCode)
    });

  } catch (error) {
    console.error('❌ Cancel Payment Error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Không thể hủy thanh toán' 
    });
  }
};

// ✅ Lấy lịch sử giao dịch (updated cho PayOS)
const getTransactionHistory = async (req, res) => {
  try {
    const userId = req.userId;
    const { dayRange } = req.query;
    
    let dateFilter = {};
    
    if (dayRange) {
      const now = new Date();
      let startDate;
      
      switch (dayRange) {
        case '7':
          startDate = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
          break;
        case '30':
          startDate = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
          break;
        case '90':
          startDate = new Date(now.getTime() - (90 * 24 * 60 * 60 * 1000));
          break;
        case '365':
          startDate = new Date(now.getTime() - (365 * 24 * 60 * 60 * 1000));
          break;
        default:
          break;
      }
      
      if (startDate) {
        dateFilter = { createdAt: { $gte: startDate } };
      }
    }
    
    const filter = { user_id: userId, ...dateFilter };
    const transactions = await Transaction.find(filter)
      .select('_id amount status description createdAt transaction_type payos_order_code')
      .sort({ createdAt: -1 });
    
    res.status(200).json(transactions);
  } catch (error) {
    console.error('Error getting transaction history:', error);
    res.status(500).json({ error: 'Không thể lấy lịch sử giao dịch' });
  }
};

// ✅ Hoàn tiền (updated cho PayOS)
const refundTransaction = async (req, res) => {
  try {
    const { transaction_id } = req.params;
    const original = await Transaction.findById(transaction_id);

    if (!original || original.status !== 'completed') {
      return res.status(400).json({ 
        error: 'Giao dịch không hợp lệ để hoàn tiền.' 
      });
    }

    // Tạo giao dịch hoàn tiền mới
    const refund = await Transaction.create({
      amount: -original.amount,
      fee: 0,
      currency: original.currency,
      transaction_type: 'refund',
      status: 'completed', // Refund thành công luôn
      description: `Hoàn tiền cho đơn hàng #${original.payos_order_code}`,
      items: original.items,
      user_id: original.user_id,
      refund_transaction_id: original._id,
      payos_order_code: parseInt(moment().format('YYMMDDHHmmss')), // New order code cho refund
      payos_response_code: 'REFUNDED',
      payos_response_desc: 'Hoàn tiền thủ công'
    });

    // Cập nhật trạng thái giao dịch gốc
    original.status = 'refunded';
    await original.save();

    res.status(201).json({
      success: true,
      message: 'Hoàn tiền thành công',
      refund_transaction: refund,
      original_transaction: original
    });
    
  } catch (error) {
    console.error('Refund error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Lỗi khi hoàn tiền' 
    });
  }
};

// ✅ Filter lịch sử (updated cho PayOS) 
const filterTransactionHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const { start_date, end_date, status } = req.query;

    const filter = { user_id: userId };

    if (status) filter.status = status;

    if (start_date || end_date) {
      filter.createdAt = {};
      if (start_date) filter.createdAt.$gte = new Date(start_date);
      if (end_date) filter.createdAt.$lte = new Date(end_date);
    }

    const transactions = await Transaction.find(filter)
      .sort({ createdAt: -1 })
      .select('_id amount status description createdAt transaction_type payos_order_code');

    if (!transactions.length) {
      return res.status(204).send();
    }

    res.status(200).json({
      success: true,
      count: transactions.length,
      transactions
    });
    
  } catch (error) {
    console.error('Filter transaction error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Lỗi khi lọc lịch sử giao dịch' 
    });
  }
};

module.exports = {
  createPayOSPayment,
  checkPayOSPaymentStatus,
  cancelPayOSPayment,
  getTransactionHistory,
  refundTransaction,
  filterTransactionHistory
};
