import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import NavigationBar from '../components/NavigationBar';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import emailjs from 'emailjs-com';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../css/Security.css';

const Security = () => {
  const { user } = useAuth();
  
  // Step control
  const [currentStep, setCurrentStep] = useState('initial'); // 'initial', 'verification', 'password'
  
  // Email verification states
  const [verificationCode, setVerificationCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [isLoadingEmail, setIsLoadingEmail] = useState(false);
  
  // Password change states
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    new: false,
    confirm: false,
    current: false
  });
  const [successMessage, setSuccessMessage] = useState('');

  const handleStartPasswordChange = () => {
    setCurrentStep('verification');
    sendVerificationCode();
  };

  const sendVerificationCode = () => {
    setIsLoadingEmail(true);
    
    const codeGenerated = Math.floor(100000 + Math.random() * 900000);
    setVerificationCode(codeGenerated.toString());

    const templateParams = {
      user_name: user.fullname || user.username,
      verification_code: codeGenerated,
      to_email: user.email,
    };

    emailjs.send(
      "service_llx7onu",
      "template_dd8viae",
      templateParams,
      "qOVKbEY7rEG5Dhe6D"
    )
    .then((response) => {
      console.log("Mã xác nhận đã được gửi thành công!", response);
      toast.success("Mã xác nhận đã được gửi tới email của bạn. Vui lòng kiểm tra hộp thư.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });
    })
    .catch((error) => {
      console.log("Có lỗi xảy ra khi gửi email:", error);
      toast.error("Đã xảy ra lỗi khi gửi mã xác nhận. Vui lòng thử lại.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });
      setCurrentStep('initial');
    })
    .finally(() => {
      setIsLoadingEmail(false);
    });
  };

  const handleVerifyCode = () => {
    if (!inputCode.trim()) {
      toast.error("Vui lòng nhập mã xác nhận.", {
        position: "top-right",
        autoClose: 5000
      });
      return;
    }

    if (inputCode.trim() === verificationCode) {
      toast.success("Xác thực thành công!", {
        position: "top-right",
        autoClose: 2000
      });
      setCurrentStep('password');
      setInputCode('');
    } else {
      toast.error("Mã xác nhận không đúng. Vui lòng kiểm tra lại.", {
        position: "top-right",
        autoClose: 5000
      });
    }
  };

  const handleResendCode = () => {
    setInputCode('');
    toast.info("Đang gửi lại mã xác nhận...", {
      position: "top-right",
      autoClose: 2000
    });
    sendVerificationCode();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear success message when user starts typing
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'Vui lòng nhập mật khẩu mới';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Mật khẩu mới phải có ít nhất 8 ký tự';
    } else if (!/(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) {
      newErrors.newPassword = 'Mật khẩu mới phải chứa ít nhất 1 chữ hoa và 1 số';
    }

    if (!formData.confirmNewPassword) {
      newErrors.confirmNewPassword = 'Vui lòng xác nhận mật khẩu mới';
    } else if (formData.newPassword !== formData.confirmNewPassword) {
      newErrors.confirmNewPassword = 'Mật khẩu xác nhận không khớp';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const token = localStorage.getItem('token');
      
      // Log để debug
      console.log('Sending request to change password...');
      console.log('Token exists:', !!token);
      console.log('New password length:', formData.newPassword.length);
      console.log('Current password length:', formData.currentPassword.length);
      
      const response = await axios.put(
        'http://localhost:8080/reptitist/auth/change-password',
        {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Password change successful:', response.data);
      
      setSuccessMessage('Mật khẩu đã được thay đổi thành công!');
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      });
      
      // Reset to initial step after success
      setTimeout(() => {
        setCurrentStep('initial');
        setSuccessMessage('');
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: ''
        });
      }, 3000);

    } catch (error) {
      console.error('Password change error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      if (error.response?.status === 401) {
        setErrors({ submit: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.' });
      } else if (error.response?.status === 400) {
        setErrors({ submit: error.response?.data?.message || 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.' });
      } else if (error.response?.status === 404) {
        setErrors({ submit: 'API endpoint không tồn tại. Vui lòng liên hệ hỗ trợ.' });
      } else if (error.code === 'ERR_NETWORK') {
        setErrors({ submit: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.' });
      } else {
        const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra. Vui lòng thử lại.';
        setErrors({ submit: `Lỗi: ${errorMessage}` });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setCurrentStep('initial');
    setInputCode('');
    setVerificationCode('');
    setFormData({
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: ''
    });
    setErrors({});
    setSuccessMessage('');
  };

  const formatDate = () => {
    const today = new Date();
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return today.toLocaleDateString('vi-VN', options).toUpperCase();
  };

  if (!user) {
    return (
      <>
        <Header />
        <div className="profile-layout">
          <NavigationBar />
          <div className="profile-container">
            <div className="welcome-header">
              <div className="welcome-content">
                <h1>Vui lòng đăng nhập</h1>
                <p>Bạn cần đăng nhập để truy cập trang bảo mật</p>
              </div>
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
      
      <div className="profile-layout">
        <NavigationBar />
        
        <div className="profile-container">
          {/* Welcome Header */}
          <div className="welcome-header">
            <div className="welcome-content">
              <h1>Xin chào, {user.fullname || user.username}</h1>
              <p>{formatDate()}</p>
            </div>
            <div className="welcome-emoji">
              🐢
            </div>
          </div>

          {/* Profile Section */}
          <div className="profile-section">
            {/* Profile Header */}
            <div className="profile-header">
              <div className="profile-user-info">
                <div className="profile-avatar">
                  <img
                    src={user.user_imageurl || "/api/placeholder/64/64"}
                    alt="Profile"
                  />
                </div>
                <div className="profile-user-details">
                  <h2>{user.username}</h2>
                  <div className="profile-badge-container">
                    <span className="profile-badge-text">
                      {user.account_type?.type === 'premium' ? 'Premium Customer' : 'Customer'}
                    </span>
                    {user.account_type?.type !== 'premium' && (
                      <button className="upgrade-button">
                        Upgrade account
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Security Title */}
            <div className="security-title">
              <h2>Thay đổi mật khẩu</h2>
            </div>

            {/* Success Message */}
            {successMessage && (
              <div className="success-message">
                {successMessage}
              </div>
            )}

            {/* Step 1: Initial Button */}
            {currentStep === 'initial' && (
              <div className="security-button-container">
                <button 
                  className="change-password-button"
                  onClick={handleStartPasswordChange}
                  disabled={isLoadingEmail}
                >
                  {isLoadingEmail ? 'Đang gửi mã...' : 'Tôi muốn thay đổi mật khẩu'}
                </button>
              </div>
            )}

            {/* Step 2: Email Verification */}
            {currentStep === 'verification' && (
              <div className="verification-section">
                <div className="security-grid">
                  <div className="security-column">
                    <div className="verification-email-field">
                      <label>Email xác thực</label>
                      <input
                        type="email"
                        value={user.email}
                        disabled
                        className="verification-email-input"
                      />
                      <div className="verification-email-success">
                        ✓ Mã xác nhận đã được gửi đến email này
                      </div>
                    </div>
                  </div>
                  
                  <div className="security-column">
                    <div className="verification-code-field">
                      <label>Mã xác nhận *</label>
                      <input
                        type="text"
                        value={inputCode}
                        onChange={(e) => {
                          const inputValue = e.target.value.replace(/\D/g, '').slice(0, 6);
                          setInputCode(inputValue);
                        }}
                        maxLength="6"
                        placeholder="Nhập mã xác nhận (6 chữ số)"
                        className="verification-code-input"
                      />
                      <div className="verification-code-help">
                        Mã xác nhận có 6 chữ số. Nếu không thấy email, vui lòng kiểm tra thư mục spam.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="verification-buttons">
                  <button 
                    className="verification-button"
                    onClick={handleVerifyCode}
                    disabled={inputCode.length !== 6}
                  >
                    Xác nhận mã
                  </button>
                  
                  <button 
                    className="verification-button secondary"
                    onClick={handleResendCode}
                    disabled={isLoadingEmail}
                  >
                    {isLoadingEmail ? 'Đang gửi...' : 'Gửi lại mã'}
                  </button>
                  
                  <button 
                    className="verification-button danger"
                    onClick={handleCancel}
                  >
                    Hủy bỏ
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Password Change Form */}
            {currentStep === 'password' && (
              <form onSubmit={handleSubmit}>
                <div className="security-grid">
                  {/* Left Column */}
                  <div className="security-column">
                    {/* Current Password Field */}
                    <div className="password-field">
                      <label htmlFor="currentPassword">Mật khẩu hiện tại *</label>
                      <div className="password-input-wrapper">
                        <input
                          type={showPasswords.current ? "text" : "password"}
                          id="currentPassword"
                          name="currentPassword"
                          value={formData.currentPassword}
                          onChange={handleInputChange}
                          className={`password-input ${errors.currentPassword ? 'error' : ''}`}
                          placeholder="Nhập mật khẩu hiện tại"
                          disabled={isSubmitting}
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('current')}
                          className="password-toggle"
                          disabled={isSubmitting}
                        >
                          {showPasswords.current ? '👁️‍🗨️' : '👁️'}
                        </button>
                      </div>
                      {errors.currentPassword && (
                        <div className="error-message">{errors.currentPassword}</div>
                      )}
                    </div>
                    
                    <div className="password-field">
                      <label htmlFor="newPassword">Mật khẩu mới *</label>
                      <div className="password-input-wrapper">
                        <input
                          type={showPasswords.new ? "text" : "password"}
                          id="newPassword"
                          name="newPassword"
                          value={formData.newPassword}
                          onChange={handleInputChange}
                          className={`password-input ${errors.newPassword ? 'error' : ''}`}
                          placeholder="Nhập mật khẩu mới (ít nhất 8 ký tự, có chữ hoa và số)"
                          disabled={isSubmitting}
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('new')}
                          className="password-toggle"
                          disabled={isSubmitting}
                        >
                          {showPasswords.new ? '👁️‍🗨️' : '👁️'}
                        </button>
                      </div>
                      {errors.newPassword && (
                        <div className="error-message">{errors.newPassword}</div>
                      )}
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="security-column">
                    <div className="password-field">
                      <label htmlFor="confirmNewPassword">Xác nhận mật khẩu mới *</label>
                      <div className="password-input-wrapper">
                        <input
                          type={showPasswords.confirm ? "text" : "password"}
                          id="confirmNewPassword"
                          name="confirmNewPassword"
                          value={formData.confirmNewPassword}
                          onChange={handleInputChange}
                          className={`password-input ${errors.confirmNewPassword ? 'error' : ''}`}
                          placeholder="Nhập lại mật khẩu mới"
                          disabled={isSubmitting}
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('confirm')}
                          className="password-toggle"
                          disabled={isSubmitting}
                        >
                          {showPasswords.confirm ? '👁️‍🗨️' : '👁️'}
                        </button>
                      </div>
                      {errors.confirmNewPassword && (
                        <div className="error-message">{errors.confirmNewPassword}</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Submit Error */}
                {errors.submit && (
                  <div className="submit-error">
                    {errors.submit}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="verification-buttons">
                  <button 
                    type="submit"
                    className="verification-button"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Đang xử lý...' : 'Thay đổi mật khẩu'}
                  </button>
                  
                  <button 
                    type="button"
                    className="verification-button danger"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                  >
                    Hủy bỏ
                  </button>
                </div>
              </form>
            )}

            {/* Account Security Info - Always show */}
            <div className="security-info-section">
              <div className="security-grid">
                <div className="security-column">
                  <div className="security-status-field">
                    <label>Trạng thái bảo mật</label>
                    <div className="security-status-box">
                      <span>✓</span>
                      <span>Tài khoản được bảo mật</span>
                    </div>
                  </div>
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

export default Security;