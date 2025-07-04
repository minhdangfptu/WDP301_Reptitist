import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { CheckCircle, XCircle } from 'lucide-react';
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';
import { baseUrl } from '../config';
import Header from '../components/Header';
import Footer from '../components/Footer';

const PaymentResult = () => {
  const [status, setStatus] = useState(null); // 'success', 'fail', 'error'
  const navigate = useNavigate();

  useEffect(() => {
    const handleVNPayReturn = async () => {
      try {
        const query = window.location.search; // ?vnp_TmnCode=...&vnp_ResponseCode=...
        const response = await axios.get(`${baseUrl}/reptitist/transactions/return${query}`);

        if (response.status === 200) {
          setStatus('success');
          toast.success(response.data || 'Giao dịch thành công!');
        } else {
          setStatus('fail');
          toast.error('Giao dịch thất bại!');
        }
      } catch (err) {
        setStatus('error');
        toast.error('Lỗi xử lý kết quả giao dịch!');
      }
    };

    handleVNPayReturn();
  }, []);

  return (
    <>
      <Header />
      <ToastContainer />
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="bg-white shadow-lg rounded-xl p-8 text-center max-w-md w-full">
          {status === 'success' && (
            <>
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold mb-2">Thanh toán thành công!</h2>
              <p className="text-gray-600 mb-4">Cảm ơn bạn đã nâng cấp gói dịch vụ.</p>
              <button
                onClick={() => navigate('/Profile')}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Về trang cá nhân
              </button>
            </>
          )}
          {status === 'fail' && (
            <>
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold mb-2">Thanh toán thất bại!</h2>
              <p className="text-gray-600 mb-4">Giao dịch không thành công. Vui lòng thử lại sau.</p>
              <button
                onClick={() => navigate('/plan-upgrade')}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Thử lại
              </button>
            </>
          )}
          {status === 'error' && (
            <>
              <XCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold mb-2">Có lỗi xảy ra!</h2>
              <p className="text-gray-600 mb-4">Không thể xác thực kết quả giao dịch.</p>
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
              >
                Quay về trang chủ
              </button>
            </>
          )}
          {!status && <p>Đang xử lý giao dịch...</p>}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PaymentResult;
