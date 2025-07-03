const Transaction = require('../models/Transactions');
const moment = require('moment');
const crypto = require('crypto');
const qs = require('qs');

function sortObject(obj) {
  let sorted = {};
  let keys = Object.keys(obj).sort();
  for (let key of keys) { 
    sorted[key] = obj[key];
  }
  return sorted;
}

const createPaymentURL = async (req, res) => {
  try {
    const { amount, user_id, items, description } = req.query;

    const orderId = moment().format('HHmmss');
    const createDate = moment().format('YYYYMMDDHHmmss');
    const ipAddr = req.ip;

    const vnp_Params = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: process.env.VNP_TMNCODE,
      vnp_Locale: 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: orderId,
      vnp_OrderInfo: description || 'Thanh toán đơn hàng',
      vnp_OrderType: 'other',
      vnp_Amount: parseInt(amount) * 100,
      vnp_ReturnUrl: process.env.VNP_RETURN_URL,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate
    };

    const signData = qs.stringify(sortObject(vnp_Params), { encode: false });
    const hmac = crypto.createHmac('sha512', process.env.VNP_HASHSECRET);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    vnp_Params.vnp_SecureHash = signed;

    const paymentUrl = process.env.VNP_URL + '?' + qs.stringify(vnp_Params, { encode: false });

    await Transaction.create({
      amount: parseInt(amount),
      fee: 0,
      currency: 'VND',
      transaction_type: 'payment',
      status: 'pending',
      description,
      items: items ? JSON.parse(items) : [],
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

  const signData = qs.stringify(sortObject(vnp_Params), { encode: false });
  const hmac = crypto.createHmac('sha512', process.env.VNP_HASHSECRET);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

  if (signed === secureHash) {
    const transaction = await Transaction.findOne({ vnp_txn_ref: vnp_Params.vnp_TxnRef });

    if (transaction) {
      transaction.status = vnp_Params.vnp_ResponseCode === '00' ? 'completed' : 'failed';
      transaction.vnp_response_code = vnp_Params.vnp_ResponseCode;
      transaction.vnp_transaction_no = vnp_Params.vnp_TransactionNo;
      transaction.raw_response = vnp_Params;
      await transaction.save();

      return res.status(200).send(`Giao dịch ${transaction.status === 'completed' ? 'thành công' : 'thất bại'}!`);
    }

    return res.status(404).send('Không tìm thấy giao dịch.');
  } else {
    res.status(400).send('Sai mã hash xác thực.');
  }
};

const getTransactionHistory = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user_id: req.params.userId }).sort({ createdAt: -1 });
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Không thể lấy lịch sử giao dịch' });
  }
};

const refundTransaction = async (req, res) => {try {
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