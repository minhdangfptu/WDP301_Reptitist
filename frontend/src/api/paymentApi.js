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

const paymentApi = {
    createVNPayTransaction,
    verifyVNPayTransaction,
};
export default paymentApi;
