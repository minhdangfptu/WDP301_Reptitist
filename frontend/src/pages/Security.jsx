import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import emailjs from 'emailjs-com';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Header from '../components/Header';
import Footer from '../components/Footer';
import NavigationBar from '../components/NavigationBar';
import { useAuth } from '../context/AuthContext';
import '../css/Security.css';

const Security = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // State management
  const [currentStep, setCurrentStep] = useState('initial');
  const [verificationCode, setVerificationCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [isLoadingEmail, setIsLoadingEmail] = useState(false);
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmNewPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    new: false,
    confirm: false
  });
  const [successMessage, setSuccessMessage] = useState('');

  // Utility functions
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

  const showToast = (type, message, options = {}) => {
    const defaultOptions = {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options
    };

    toast[type](message, defaultOptions);
  };

  const resetForm = () => {
    setCurrentStep('initial');
    setInputCode('');
    setVerificationCode('');
    setFormData({
      newPassword: '',
      confirmNewPassword: ''
    });
    setErrors({});
    setSuccessMessage('');
  };

  // Email verification logic
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
    .then(() => {
      showToast('success', "Mã xác nhận đã được gửi tới email của bạn. Vui lòng kiểm tra hộp thư.");
    })
    .catch(() => {
      showToast('error', "Đã xảy ra lỗi khi gửi mã xác nhận. Vui lòng thử lại.");
      setCurrentStep('initial');
    })
    .finally(() => {
      setIsLoadingEmail(false);
    });
  };

  // Event handlers
  const handleStartPasswordChange = () => {
    setCurrentStep('verification');
    sendVerificationCode();
  };

  const handleVerifyCode = () => {
    if (!inputCode.trim()) {
      showToast('error', "Vui lòng nhập mã xác nhận.");
      return;
    }

    if (inputCode.trim() === verificationCode) {
      showToast('success', "Xác thực thành công!", { autoClose: 2000 });
      setCurrentStep('password');
      setInputCode('');
    } else {
      showToast('error', "Mã xác nhận không đúng. Vui lòng kiểm tra lại.");
    }
  };

  const handleResendCode = () => {
    setInputCode('');
    showToast('info', "Đang gửi lại mã xác nhận...", { autoClose: 2000 });
    sendVerificationCode();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  const handleCodeInputChange = (e) => {
    const inputValue = e.target.value.replace(/\D/g, '').slice(0, 6);
    setInputCode(inputValue);
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};

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

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const token = localStorage.getItem('token');
      
      await axios.post(
        'http://localhost:8080/reptitist/auth/change-password-email',
        {
          newPassword: formData.newPassword
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      showToast('success', 'Mật khẩu đã được thay đổi thành công! Bạn sẽ được đăng xuất để đăng nhập lại.', {
        autoClose: 3000
      });
      
      setSuccessMessage('Mật khẩu đã được thay đổi thành công!');
      setFormData({
        newPassword: '',
        confirmNewPassword: ''
      });
      
      // Auto logout after 3 seconds
      setTimeout(async () => {
        await logout();
        navigate('/Login');
      }, 3000);

    } catch (error) {
      console.error('Password change error:', error);
      
      let errorMessage = 'Có lỗi xảy ra. Vui lòng thử lại.';
      
      if (error.response?.status === 401) {
        errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
      } else if (error.response?.status === 400) {
        errorMessage = error.response?.data?.message || 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setErrors({ submit: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render guards
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

  // Render methods
  const renderInitialStep = () => (
    <div className="security-button-container">
      <button 
        className="change-password-button"
        onClick={handleStartPasswordChange}
        disabled={isLoadingEmail}
      >
        {isLoadingEmail ? 'Đang gửi mã...' : 'Tôi muốn thay đổi mật khẩu'}
      </button>
    </div>
  );

  const renderVerificationStep = () => (
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
              Mã xác nhận đã được gửi đến email này
            </div>
          </div>
        </div>
        
        <div className="security-column">
          <div className="verification-code-field">
            <label>Mã xác nhận *</label>
            <input
              type="text"
              value={inputCode}
              onChange={handleCodeInputChange}
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
          onClick={resetForm}
        >
          Hủy bỏ
        </button>
      </div>
    </div>
  );

  const renderPasswordStep = () => (
    <form onSubmit={handleSubmit}>
      <div className="security-grid">
        <div className="security-column">
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

      {errors.submit && (
        <div className="submit-error">
          {errors.submit}
        </div>
      )}

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
          onClick={resetForm}
          disabled={isSubmitting}
        >
          Hủy bỏ
        </button>
      </div>
    </form>
  );

  const renderSecurityInfo = () => (
    <div className="security-info-section">
      <div className="security-grid">
        <div className="security-column">
          <div className="security-field">
            <label>Email tài khoản</label>
            <p>{user.email}</p>
          </div>
          <div className="security-field">
            <label>Trạng thái bảo mật</label>
            <p>✓ Tài khoản được bảo mật</p>
          </div>
        </div>
        <div className="security-column">
          <div className="security-field">
            <label>Ngày tạo tài khoản</label>
            <p>{user.created_at ? new Date(user.created_at).toLocaleDateString('vi-VN') : 'Không xác định'}</p>
          </div>
          <div className="security-field">
            <label>Lần cập nhật cuối</label>
            <p>{user.updated_at ? new Date(user.updated_at).toLocaleDateString('vi-VN') : 'Không xác định'}</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Main render
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
                  {user.account_type?.type === 'premium' ? (
                    <div className="profile-badge-container">
                      <span className="profile-badge-text">Premium Customer</span>
                    </div>
                  ) : (
                    <Link to="/PlanUpgrade" className="profile-badge-container">
                      <span className="profile-badge-text">Customer</span>
                      <span className="upgrade-button">Upgrade account</span>
                    </Link>
                  )}
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

            {/* Render step content based on current step */}
            {currentStep === 'initial' && renderInitialStep()}
            {currentStep === 'verification' && renderVerificationStep()}
            {currentStep === 'password' && renderPasswordStep()}

            {/* Security Info - Always show */}
            {renderSecurityInfo()}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Security;