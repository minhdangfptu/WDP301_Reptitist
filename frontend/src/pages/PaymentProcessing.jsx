import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { toast, ToastContainer } from 'react-toastify';
import { ArrowLeft, CheckCircle, Copy, Clock, CreditCard, Smartphone, ExternalLink } from 'lucide-react';
import 'react-toastify/dist/ReactToastify.css';
import '../css/PaymentProcessing.css';
import axios from 'axios';
import { baseUrl } from '../config';

const PaymentProcessing = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, updateUser } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); // 15 phút = 900 giây
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [transferCode, setTransferCode] = useState('');
  
  // PayOS States
  const [payosPaymentUrl, setPayosPaymentUrl] = useState('');
  const [payosOrderCode, setPayosOrderCode] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [polling, setPolling] = useState(false);

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
  // console.log('Payment Data:', paymentData);

  let planNameForBackend = planName;
  if (planType === 'partner' && (planName.toLowerCase() === 'gói premium' || planName.toLowerCase() === 'premium')) {
    planNameForBackend = 'Gold';
  } else if (planType === 'partner' && planName.toLowerCase() === 'gói super premium') {
    planNameForBackend = 'Diamond';
  } else if (planType === 'individual' && planName.toLowerCase() === 'premium') {
    planNameForBackend = 'Silver';
  }

  // Thông tin ngân hàng cố định (backup method)
  const bankInfo = {
    bankName: 'MBBank',
    accountNumber: '0396692258',
    accountName: 'Do Quang Huy',
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

  const handlePayOSPayment = async () => {
    setIsProcessing(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        setIsProcessing(false);
        return;
      }

      const response = await axios.get(`${baseUrl}/reptitist/transactions/payos/create`, {
        params: {
          amount: price,
          user_id: user.id,
          items: JSON.stringify({
            plan_name: planNameForBackend,
            plan_type: planType,
            period,
            price
          }),
          description: `${planNameForBackend} ${period === 'monthly' ? 'thang' : 'nam'}`
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setPayosPaymentUrl(response.data.paymentUrl);
        setPayosOrderCode(response.data.orderCode);
        setPaymentStatus('pending');
        
        toast.success('Đã tạo link thanh toán PayOS!');
        
        // Mở PayOS trong tab mới
        window.open(response.data.paymentUrl, '_blank');
        
        // Bắt đầu polling
        startPaymentPolling(response.data.orderCode);
      }

    } catch (error) {
      console.error('PayOS Payment Error:', error);
      toast.error(error.response?.data?.message || 'Không thể tạo thanh toán PayOS');
    } finally {
      setIsProcessing(false);
    }
  };

  // ✅ Polling để check PayOS status
  const startPaymentPolling = (orderCode) => {
    setPolling(true);
    
    const pollInterval = setInterval(async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await axios.get(`${baseUrl}/reptitist/transactions/payos/status/${orderCode}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.data.success) {
          const currentStatus = response.data.status;
          setPaymentStatus(currentStatus);
          
          if (currentStatus === 'completed') {
            clearInterval(pollInterval);
            setPolling(false);
            await handlePaymentSuccess(response.data);
          } else if (currentStatus === 'cancelled') {
            clearInterval(pollInterval);
            setPolling(false);
            toast.warning('Thanh toán đã bị hủy');
          } else if (currentStatus === 'failed') {
            clearInterval(pollInterval);
            setPolling(false);
            toast.error('Thanh toán thất bại');
          }
        }
        
      } catch (error) {
        console.error('Status check error:', error);
      }
    }, 3000); // Check mỗi 3 giây

    // Dừng polling sau 15 phút
    setTimeout(() => {
      clearInterval(pollInterval);
      setPolling(false);
    }, 900000);
  };

  const checkPayOSStatus = async () => {
    if (!payosOrderCode) return;
    
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${baseUrl}/reptitist/transactions/payos/status/${payosOrderCode}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setPaymentStatus(response.data.status);
        
        if (response.data.status === 'completed') {
          await handlePaymentSuccess(response.data);
        }
        
        toast.info(`Trạng thái: ${response.data.status}`);
      }
    } catch (error) {
      console.error('Manual status check error:', error);
      toast.error('Không thể kiểm tra trạng thái');
    }
  };

  const cancelPayOSPayment = async () => {
    if (!payosOrderCode) return;
    
    try {
      const token = localStorage.getItem('access_token');
      await axios.post(`${baseUrl}/reptitist/transactions/payos/cancel/${payosOrderCode}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setPaymentStatus('cancelled');
      setPolling(false);
      toast.warning('Đã hủy thanh toán PayOS');
      
    } catch (error) {
      console.error('Cancel payment error:', error);
      toast.error('Không thể hủy thanh toán');
    }
  };

  const handlePaymentSuccess = async (paymentData) => {
    setIsProcessing(true);
    
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        setIsProcessing(false);
        return;
      }

      const expiresAt = period === 'monthly' ? 
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : // 30 days
        new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);  // 365 days

      if (planType === 'partner'&& planNameForBackend === 'Gold') {
        const updateData = {
          account_type: {
            type: 3,
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
          const updatedUser = {
            ...user,
            account_type: updateData.account_type
          };

          updateUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
        } else {
          throw new Error('Failed to update account type to shop');
        }
      } else if (planType === 'individual' && planNameForBackend === 'Silver') {
        const response = await axios.put(
          `${baseUrl}/reptitist/auth/update-role`,
          {
            account_type: {
              type: 2,
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
          navigate('/ProductManagement'); 
        } else {
          navigate('/Profile'); 
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

  const handleManualPaymentComplete = async () => {
    await handlePaymentSuccess({ type: 'manual' });
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

            {/* ✅ PayOS Status Display */}
            {paymentStatus && (
              <div className="payos-status-display">
                <div className="payos-status-row">
                  <span className="payos-status-label">Trạng thái PayOS:</span>
                  <span className={`payos-status-badge payos-status-${paymentStatus}`}>
                    {paymentStatus === 'completed' ? '✅ Thành công' :
                     paymentStatus === 'pending' ? '⏳ Đang chờ' :
                     paymentStatus === 'cancelled' ? '❌ Đã hủy' :
                     paymentStatus === 'failed' ? '💥 Thất bại' : paymentStatus}
                  </span>
                </div>
                {payosOrderCode && (
                  <p className="payos-order-code">Mã đơn: {payosOrderCode}</p>
                )}
                {polling && (
                  <p className="payos-polling-text">
                    <div className="payos-spinner"></div>
                    Đang kiểm tra trạng thái...
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="payment-grid">
            {/* ✅ PayOS Payment Section */}
            <div className="payment-section">
              <h2 className="payment-section-title">
                <Smartphone className="icon-20" />
                Thanh toán PayOS (Khuyến nghị)
              </h2>
              
              <div className="payos-gradient-section">
                <div className="payos-title">
                  Thanh toán nhanh chóng & an toàn
                </div>
                <div className="payos-subtitle">
                  Hỗ trợ QR Banking, Internet Banking, Ví điện tử
                </div>

                {!payosPaymentUrl && (
                  <button 
                    className="payos-btn payos-btn-primary"
                    onClick={handlePayOSPayment}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <div className="payos-loading">
                        <div className="payos-spinner"></div>
                        Đang tạo...
                      </div>
                    ) : (
                      '🚀 Thanh toán với PayOS'
                    )}
                  </button>
                )}

                {payosPaymentUrl && paymentStatus !== 'completed' && (
                  <>
                    <button 
                      onClick={() => window.open(payosPaymentUrl, '_blank')}
                      className="payos-btn payos-btn-success"
                    >
                      <ExternalLink className="icon-16" />
                      Mở trang thanh toán PayOS
                    </button>

                    <div className="payos-btn-group">
                      <button 
                        onClick={checkPayOSStatus}
                        className="payos-btn payos-btn-secondary"
                      >
                        🔍 Kiểm tra trạng thái
                      </button>
                      
                      {paymentStatus === 'pending' && (
                        <button 
                          onClick={cancelPayOSPayment}
                          className="payos-btn payos-btn-danger"
                        >
                          ❌ Hủy PayOS
                        </button>
                      )}
                    </div>
                  </>
                )}

                {paymentStatus === 'completed' && (
                  <div className="payos-success-display">
                    <CheckCircle className="payos-success-icon" />
                    <p className="payos-success-text">
                      🎉 Thanh toán PayOS thành công!
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Thông tin chuyển khoản (backup method) */}
            <div className="payment-section">
              <h2 className="payment-section-title">
                <CreditCard className="w-6 h-6 mr-2" />
                Chuyển khoản ngân hàng
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

              <div className="qr-section">
                <div className="qr-code-container">
                  <img src={qrCodeUrl} alt="QR Code" className="qr-code" />
                </div>
                <p className="qr-description">
                  Quét mã QR bằng ứng dụng ngân hàng của bạn
                </p>
                <button 
                  className="payment-confirm-btn"
                  onClick={handleManualPaymentComplete}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <span className="loading-spinner"></span>
                      Đang xử lý...
                    </>
                  ) : (
                    'Xác nhận chuyển khoản thủ công'
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="payment-note">
            <div className="payment-warning">
              <p><strong>Khuyến nghị:</strong> Sử dụng PayOS để thanh toán nhanh chóng và an toàn nhất.</p>
              <p>Chỉ sử dụng chuyển khoản thủ công khi PayOS không khả dụng.</p>
            </div>
            <div className="payment-guide">
              <h3 className="payment-guide-title">Hướng dẫn thanh toán</h3>
              <div className="payment-guide-grid">
                <div className="payment-guide-step">
                  <div className="payment-guide-icon">1</div>
                  <h4>PayOS</h4>
                  <p>Nhấn "Thanh toán PayOS" → Quét QR hoặc chọn ngân hàng</p>
                </div>
                <div className="payment-guide-step">
                  <div className="payment-guide-icon">2</div>
                  <h4>Tự động</h4>
                  <p>Hệ thống tự động cập nhật khi thanh toán thành công</p>
                </div>
                <div className="payment-guide-step">
                  <div className="payment-guide-icon">3</div>
                  <h4>Hoàn tất</h4>
                  <p>Tài khoản được nâng cấp ngay lập tức</p>
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