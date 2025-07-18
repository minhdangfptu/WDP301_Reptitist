import axiosClient from "./axiosClient";

// Tạo giao dịch thanh toán VNPay
const createVNPayTransaction = (data) => {
  // data: { amount, user_id, items, description, returnUrl }
  return axiosClient.get('transactions/create', {params:data});
};

// Xác thực kết quả thanh toán VNPay (sau khi user được redirect về)
const verifyVNPayTransaction = (queryString) => {
  // queryString: dạng 'vnp_Amount=...&vnp_TxnRef=...'
  return axiosClient.get(`transactions/vnpay/verify?${queryString}`);
};
const getTransactionHistory = (dayRange) => {  
  return axiosClient.get(`transactions/history?dayRange=${dayRange}`);
};

// Lấy báo cáo tài chính cho admin
export const getAdminFinancialReports = async ({ page = 1, limit = 20, startDate, endDate, transaction_type, status }) => {
  const params = new URLSearchParams();
  params.append('page', page);
  params.append('limit', limit);
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  if (transaction_type && transaction_type !== 'all') params.append('transaction_type', transaction_type);
  if (status && status !== 'all') params.append('status', status);
  const res = await axiosClient.get(`/admin/financial-reports?${params.toString()}`);
  return res.data;
};

const paymentApi = {
    createVNPayTransaction,
    verifyVNPayTransaction,
    getTransactionHistory,
    getAdminFinancialReports,
};
export default paymentApi;
