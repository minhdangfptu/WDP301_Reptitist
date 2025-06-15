import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { toast, ToastContainer } from 'react-toastify';
import { ArrowLeft, CheckCircle, Copy, Clock, CreditCard } from 'lucide-react';
import 'react-toastify/dist/ReactToastify.css';
import '../css/PaymentProcessing.css';
import axios from 'axios';
const baseUrl = import.meta.env.VITE_BACKEND_URL;
const PaymentProcessing = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, updateUser } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); // 15 phút = 900 giây
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [transferCode, setTransferCode] = useState('');

  // Lấy thông tin từ state hoặc redirect về trang trước nếu không có
  const paymentData = location.state;

  useEffect(() => {
    if (!paymentData) {
      toast.error('Không tìm thấy thông tin thanh toán');
      navigate('/plan-upgrade');
      return;
    }
  }, [paymentData, navigate]);

  useEffect(() => {
    // Tạo mã chuyển khoản một lần khi component mount
    const code = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    setTransferCode(code);
  }, []);

  // Đếm ngược thời gian
  useEffect(() => {
    if (timeLeft > 0 && !paymentCompleted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      toast.error('Thời gian thanh toán đã hết. Vui lòng thử lại.');
      navigate('/plan-upgrade');
    }
  }, [timeLeft, paymentCompleted, navigate]);

  if (!paymentData) {
    return <div>Loading...</div>;
  }

  const { planName, period, price, planType } = paymentData;

  // Thông tin ngân hàng cố định
  const bankInfo = {
    bankName: 'Vietcombank',
    accountNumber: '1234567890',
    accountName: 'REPTITIST COMPANY LIMITED',
    transferContent: `REPTITIST ${user?.username || 'USER'} ${planName} ${transferCode}`
  };

  // QR Code URL (dùng QR generator API)
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=Bank: ${bankInfo.bankName}%0AAccount: ${bankInfo.accountNumber}%0AAmount: ${price}%0AContent: ${bankInfo.transferContent}`;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Đã sao chép vào clipboard');
  };

  const handlePaymentComplete = async () => {
    setIsProcessing(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        setIsProcessing(false);
        return;
      }

      // Determine the expiration date based on period
      const expiresAt = period === 'monthly' ? 
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : // 30 days
        new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);  // 365 days

      // First, create transaction record
      const transactionResponse = await axios.post(
        `${baseUrl}/reptitist/transactions`,
        {
          amount: price,
          net_amount: price,
          transaction_type: planType === 'partner' ? 'shop_upgrade' : 'premium_upgrade',
          status: 'completed',
          description: `Thanh toán nâng cấp ${planName} ${period === 'monthly' ? 'hàng tháng' : 'hàng năm'}`,
          items: JSON.stringify({
            plan_name: planName,
            plan_type: planType,
            period: period,
            price: price,
            transfer_code: transferCode
          }),
          user_id: user.id
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!transactionResponse.data || !transactionResponse.data.transaction) {
        throw new Error('Failed to create transaction record');
      }

      // Update user account type based on planType
      if (planType === 'partner') {
        // Update account type to shop
        const updateData = {
          account_type: {
            type: 'shop',
            level: planName === 'Gói Premium' ? 'premium' : 'normal',
            activated_at: new Date(),
            expires_at: expiresAt
          }
        };

        const response = await axios.put(
          `${baseUrl}/reptitist/auth/update-role`,
          updateData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.status === 200) {
          // Update local user data
          const updatedUser = {
            ...user,
            account_type: updateData.account_type
          };

          updateUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
        } else {
          throw new Error('Failed to update account type to shop');
        }
      } else if (planType === 'individual' && planName === 'Premium') {
        // Update account type to premium for individual plan
        const response = await axios.put(
          `${baseUrl}/reptitist/auth/update-role`,
          {
            account_type: {
              type: 'customer',
              level: 'premium',
              activated_at: new Date(),
              expires_at: expiresAt
            }
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.status === 200) {
          // Update local user data
          const updatedUserData = response.data;
          updateUser(updatedUserData);
          localStorage.setItem('user', JSON.stringify(updatedUserData));
        } else {
          throw new Error('Failed to update account type');
        }
      }

      setPaymentCompleted(true);
      toast.success('Thanh toán thành công! Tài khoản của bạn đã được nâng cấp.');
      
      setTimeout(() => {
        if (planType === 'partner') {
          navigate('/ProductManagement'); // Redirect to product management for shop
        } else {
          navigate('/Profile'); // Redirect to profile for premium customer
        }
      }, 3000);

    } catch (error) {
      console.error('Payment processing error:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        toast.error(error.response.data.message || 'Có lỗi xảy ra khi xử lý thanh toán. Vui lòng thử lại.');
      } else if (error.request) {
        console.error('Error request:', error.request);
        toast.error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet của bạn.');
      } else {
        console.error('Error message:', error.message);
        toast.error('Có lỗi xảy ra khi xử lý thanh toán. Vui lòng thử lại.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  if (paymentCompleted) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Thanh toán thành công!</h2>
            <p className="text-gray-600 mb-4">
              Tài khoản của bạn đã được nâng cấp lên gói {planName}
              {planType === 'partner' && (
                <span className="block mt-2 text-green-600 font-semibold">
                  Bạn đã trở thành đối tác của chúng tôi!
                </span>
              )}
            </p>
            <div className="text-sm text-gray-500">
              Đang chuyển hướng...
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      
      <div className="payment-page">
        <div className="payment-container">
          {/* Header */}
          <div className="payment-header">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Quay lại
            </button>
            
            <div className="payment-title">Thanh toán gói dịch vụ</div>
            <div className="payment-timer">
              <Clock className="w-4 h-4 mr-2" />
              <span>{formatTime(timeLeft)}</span>
            </div>
            
            <div className="payment-plan-info">
              <div className="payment-info-item">
                <div className="payment-info-label">Gói dịch vụ</div>
                <div className="payment-info-value">{planName}</div>
              </div>
              <div className="payment-info-item">
                <div className="payment-info-label">Loại gói</div>
                <div className="payment-info-value">
                  {planType === 'partner' ? 'Đối tác' : 'Cá nhân'}
                </div>
              </div>
              <div className="payment-info-item">
                <div className="payment-info-label">Chu kỳ</div>
                <div className="payment-info-value">
                  {period === 'monthly' ? 'Hàng tháng' : 'Hàng năm'}
                </div>
              </div>
              <div className="payment-info-item">
                <div className="payment-info-label">Tổng tiền</div>
                <div className="payment-info-price">{formatPrice(price)} đ</div>
              </div>
            </div>
          </div>

          <div className="payment-grid">
            {/* Thông tin chuyển khoản */}
            <div className="payment-section">
              <h2 className="payment-section-title">
                <CreditCard className="w-6 h-6 mr-2" />
                Thông tin chuyển khoản
              </h2>
              
              <div className="bank-info-item bank">
                <div>
                  <div className="bank-info-label">Ngân hàng</div>
                  <div className="bank-info-value">{bankInfo.bankName}</div>
                </div>
                <button className="copy-button" onClick={() => copyToClipboard(bankInfo.bankName)}>
                  <Copy className="w-5 h-5" />
                </button>
              </div>

              <div className="bank-info-item account">
                <div>
                  <div className="bank-info-label">Số tài khoản</div>
                  <div className="bank-info-value">{bankInfo.accountNumber}</div>
                </div>
                <button className="copy-button" onClick={() => copyToClipboard(bankInfo.accountNumber)}>
                  <Copy className="w-5 h-5" />
                </button>
              </div>

              <div className="bank-info-item name">
                <div>
                  <div className="bank-info-label">Tên tài khoản</div>
                  <div className="bank-info-value">{bankInfo.accountName}</div>
                </div>
                <button className="copy-button" onClick={() => copyToClipboard(bankInfo.accountName)}>
                  <Copy className="w-5 h-5" />
                </button>
              </div>

              <div className="bank-info-item amount">
                <div>
                  <div className="bank-info-label">Số tiền</div>
                  <div className="bank-info-amount">{formatPrice(price)} đ</div>
                </div>
                <button className="copy-button" onClick={() => copyToClipboard(price.toString())}>
                  <Copy className="w-5 h-5" />
                </button>
              </div>

              <div className="bank-info-item content">
                <div>
                  <div className="bank-info-label">Nội dung chuyển khoản</div>
                  <div className="bank-info-value">{bankInfo.transferContent}</div>
                </div>
                <button className="copy-button" onClick={() => copyToClipboard(bankInfo.transferContent)}>
                  <Copy className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* QR Code */}
            <div className="payment-section">
              <div className="qr-section">
                <div className="qr-code-container">
                  <img src={qrCodeUrl} alt="QR Code" className="qr-code" />
                </div>
                <p className="qr-description">
                  Quét mã QR bằng ứng dụng ngân hàng của bạn để thực hiện thanh toán nhanh chóng
                </p>
                <button 
                  className="payment-confirm-btn"
                  onClick={handlePaymentComplete}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <span className="loading-spinner"></span>
                      Đang xử lý...
                    </>
                  ) : (
                    'Xác nhận thanh toán'
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="payment-note">
            <div className="payment-warning">
              <p>Lưu ý: Vui lòng chuyển khoản đúng số tiền và nội dung để tránh trường hợp xử lý chậm trễ.</p>
            </div>
            <div className="payment-guide">
              <h3 className="payment-guide-title">Hướng dẫn thanh toán</h3>
              <div className="payment-guide-grid">
                <div className="payment-guide-step">
                  <div className="payment-guide-icon">1</div>
                  <h4>Chuyển khoản</h4>
                  <p>Chuyển khoản theo thông tin bên trên hoặc quét mã QR</p>
                </div>
                <div className="payment-guide-step">
                  <div className="payment-guide-icon">2</div>
                  <h4>Xác nhận</h4>
                  <p>Nhấn nút "Xác nhận thanh toán" sau khi chuyển khoản</p>
                </div>
                <div className="payment-guide-step">
                  <div className="payment-guide-icon">3</div>
                  <h4>Hoàn tất</h4>
                  <p>Hệ thống sẽ tự động cập nhật tài khoản của bạn</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PaymentProcessing;