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

const paymentApi = {
    createVNPayTransaction,
    verifyVNPayTransaction,
    getTransactionHistory
};
export default paymentApi;
