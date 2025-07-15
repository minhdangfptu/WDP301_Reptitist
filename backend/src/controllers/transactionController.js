const Transaction = require('../models/Transactions');
const moment = require('moment');
const crypto = require('crypto');
const qs = require('qs');
const { env } = require('process');

function sortObject(obj) {
  let sorted = {};
  let keys = Object.keys(obj).sort();
  for (let key of keys) {
    sorted[key] = obj[key];
  }
  return sorted;
}

// Lấy return URL động (ngrok hoặc production)


const createPaymentURL = async (req, res) => {
  try {
    const { amount, user_id, items, description } = req.query;

    const orderId = moment().format('HHmmss');
    const createDate = moment().format('YYYYMMDDHHmmss');
    const ipAddr = '127.0.0.1';

    const vnp_Params = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: process.env.VNP_TMNCODE,
      vnp_Locale: 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: orderId,
      vnp_OrderInfo: description || 'Thanh toan don hang',
      vnp_OrderType: 'other',
      vnp_Amount: parseInt(amount) * 100,
      vnp_ReturnUrl: process.env.VNPAY_RETURN_URL || 'http://localhost:8080/reptitist/transactions/vnpay_return',
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate
    };
    console.log('vnp_Params:', vnp_Params);
    const signData = qs.stringify(sortObject(vnp_Params), { encode:true, format: 'RFC3986' });
    console.log('Sign Data:', signData);
    const hmac = crypto.createHmac('sha512', process.env.VNP_HASHSECRET);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    console.log('Signed Hash:', signed);
    vnp_Params.vnp_SecureHash = signed;

    const paymentUrl = process.env.VNP_URL + '?' + qs.stringify(vnp_Params, { encode: true, format: 'RFC3986'});
    console.log('Payment URL:', paymentUrl);
    await Transaction.create({
      amount: parseInt(amount),
      fee: 0,
      currency: 'VND',
      transaction_type: 'payment',
      status: 'pending',
      description,
      items: typeof items === 'string' ? items : JSON.stringify(items),
      user_id,
      vnp_txn_ref: orderId
    });

    res.status(201).json({ paymentUrl });
  } catch (error) {
    console.error('Error creating payment URL:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

const handlePaymentReturn = async (req, res) => {
  const vnp_Params = req.query;
  const secureHash = vnp_Params.vnp_SecureHash;

  delete vnp_Params.vnp_SecureHash;
  delete vnp_Params.vnp_SecureHashType;

  const sortedParams = sortObject(vnp_Params);
  const signData = Object.entries(sortedParams)
    .map(([key, val]) => `${key}=${decodeURIComponent(val)}`)
    .join('&');
  const hmac = crypto.createHmac('sha512', process.env.VNP_HASHSECRET);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

  if (signed !== secureHash) {
    // Sai mã hash -> redirect về frontend báo lỗi
    return res.redirect(`${process.env.FRONTEND_RETURN_URL}?status=invalid`);
  }

  const transaction = await Transaction.findOne({ vnp_txn_ref: vnp_Params.vnp_TxnRef });

  if (!transaction) {
    return res.redirect(`${process.env.FRONTEND_RETURN_URL}?status=notfound`);
  }

  // Cập nhật trạng thái
  transaction.status = vnp_Params.vnp_ResponseCode === '00' ? 'completed' : 'failed';
  transaction.vnp_response_code = vnp_Params.vnp_ResponseCode;
  transaction.vnp_transaction_no = vnp_Params.vnp_TransactionNo;
  transaction.raw_response = vnp_Params;
  await transaction.save();

  // ✅ Redirect về frontend kèm trạng thái và mã giao dịch
  return res.redirect(`${process.env.FRONTEND_RETURN_URL}?status=${transaction.status}&txnRef=${transaction.vnp_txn_ref}`);
};

const getTransactionHistory = async (req, res) => {
  try {
    const  userId  = req.userId;
    const { dayRange } = req.query;
    
    let dateFilter = {};
    
    // Xử lý dayRange để lọc theo khoảng thời gian
    if (dayRange) {
      const now = new Date();
      let startDate;
      
      switch (dayRange) {
        case '7':
          startDate = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000)); // 7 ngày qua
          break;
        case '30':
          startDate = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000)); // 30 ngày
          break;
        case '90':
          startDate = new Date(now.getTime() - (90 * 24 * 60 * 60 * 1000)); // 3 tháng
          break;
        case '365':
          startDate = new Date(now.getTime() - (365 * 24 * 60 * 60 * 1000)); // 1 năm
          break;
        default:
          // Nếu không có dayRange hoặc giá trị không hợp lệ, lấy tất cả
          break;
      }
      
      if (startDate) {
        dateFilter = { createdAt: { $gte: startDate } };
      }
    }
    
    const filter = { user_id: userId, ...dateFilter };
    const transactions = await Transaction.find(filter)
      .select('_id amount status description createdAt transaction_type')
      .sort({ createdAt: -1 });
    
    res.status(200).json(transactions);
  } catch (error) {
    console.error('Error getting transaction history:', error);
    res.status(500).json({ error: 'Không thể lấy lịch sử giao dịch' });
  }
};

const refundTransaction = async (req, res) => {
  try {
    const { transaction_id } = req.params;
    const original = await Transaction.findById(transaction_id);

    if (!original || original.status !== 'completed') {
      return res.status(400).json({ error: 'Giao dịch không hợp lệ để hoàn tiền.' });
    }

    // Tạo giao dịch hoàn tiền mới
    const refund = await Transaction.create({
      amount: -original.amount,
      fee: 0,
      currency: original.currency,
      transaction_type: 'refund',
      status: 'refunded',
      description: `Hoàn tiền cho giao dịch ${original._id}`,
      items: original.items,
      user_id: original.user_id,
      refund_transaction_id: original._id,
      vnp_txn_ref: `refund_${original.vnp_txn_ref}`,
      vnp_response_code: '00',
      vnp_transaction_no: null,
      raw_response: null
    });

    // Cập nhật trạng thái giao dịch gốc nếu muốn
    original.status = 'refunded';
    await original.save();

    res.status(201).json({
      message: 'Hoàn tiền thành công',
      refund_transaction: refund
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi hoàn tiền' });
  }
};
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

    const transactions = await Transaction.find(filter).sort({ createdAt: -1 });

    if (!transactions.length) return res.status(204).send();

    return res.status(200).json(transactions);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Lỗi server khi lọc lịch sử giao dịch' });
  }
};
module.exports = {
  createPaymentURL,
  handlePaymentReturn,
  getTransactionHistory,
  refundTransaction,
  filterTransactionHistory
};