import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import NavigationBar from '../components/NavigationBar';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import '../css/Security.css';

const Security = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [successMessage, setSuccessMessage] = useState('');

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

    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'Mật khẩu mới phải khác mật khẩu hiện tại';
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
      const response = await axios.put(
        'http://localhost:8080/reptitist/auth/change-password',
        {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setSuccessMessage('Mật khẩu đã được thay đổi thành công!');
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      });

    } catch (error) {
      if (error.response?.status === 400) {
        setErrors({ currentPassword: 'Mật khẩu hiện tại không đúng' });
      } else if (error.response?.status === 401) {
        setErrors({ submit: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.' });
      } else {
        setErrors({ submit: error.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.' });
      }
    } finally {
      setIsSubmitting(false);
    }
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
              <h2>Bảo mật</h2>
            </div>

            {/* Success Message */}
            {successMessage && (
              <div style={{
                backgroundColor: '#d4edda',
                border: '1px solid #c3e6cb',
                color: '#155724',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '20px',
                textAlign: 'center'
              }}>
                {successMessage}
              </div>
            )}

            {/* Change Password Form */}
            <form onSubmit={handleSubmit}>
              <div className="security-grid">
                {/* Left Column */}
                <div className="security-column">
                  <div className="security-field">
                    <label htmlFor="currentPassword">Mật khẩu hiện tại *</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPasswords.current ? "text" : "password"}
                        id="currentPassword"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleInputChange}
                        style={{
                          width: '100%',
                          padding: '12px 40px 12px 16px',
                          border: `1px solid ${errors.currentPassword ? '#dc3545' : '#d1d5db'}`,
                          borderRadius: '8px',
                          fontSize: '16px'
                        }}
                        placeholder="Nhập mật khẩu hiện tại"
                        disabled={isSubmitting}
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('current')}
                        style={{
                          position: 'absolute',
                          right: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '16px'
                        }}
                        disabled={isSubmitting}
                      >
                        {showPasswords.current ? '👁️‍🗨️' : '👁️'}
                      </button>
                    </div>
                    {errors.currentPassword && (
                      <div style={{ color: '#dc3545', fontSize: '14px', marginTop: '5px' }}>
                        {errors.currentPassword}
                      </div>
                    )}
                  </div>

                  <div className="security-field">
                    <label htmlFor="newPassword">Mật khẩu mới *</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPasswords.new ? "text" : "password"}
                        id="newPassword"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        style={{
                          width: '100%',
                          padding: '12px 40px 12px 16px',
                          border: `1px solid ${errors.newPassword ? '#dc3545' : '#d1d5db'}`,
                          borderRadius: '8px',
                          fontSize: '16px'
                        }}
                        placeholder="Nhập mật khẩu mới (ít nhất 8 ký tự, có chữ hoa và số)"
                        disabled={isSubmitting}
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('new')}
                        style={{
                          position: 'absolute',
                          right: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '16px'
                        }}
                        disabled={isSubmitting}
                      >
                        {showPasswords.new ? '👁️‍🗨️' : '👁️'}
                      </button>
                    </div>
                    {errors.newPassword && (
                      <div style={{ color: '#dc3545', fontSize: '14px', marginTop: '5px' }}>
                        {errors.newPassword}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column */}
                <div className="security-column">
                  <div className="security-field">
                    <label htmlFor="confirmNewPassword">Xác nhận mật khẩu mới *</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPasswords.confirm ? "text" : "password"}
                        id="confirmNewPassword"
                        name="confirmNewPassword"
                        value={formData.confirmNewPassword}
                        onChange={handleInputChange}
                        style={{
                          width: '100%',
                          padding: '12px 40px 12px 16px',
                          border: `1px solid ${errors.confirmNewPassword ? '#dc3545' : '#d1d5db'}`,
                          borderRadius: '8px',
                          fontSize: '16px'
                        }}
                        placeholder="Nhập lại mật khẩu mới"
                        disabled={isSubmitting}
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('confirm')}
                        style={{
                          position: 'absolute',
                          right: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '16px'
                        }}
                        disabled={isSubmitting}
                      >
                        {showPasswords.confirm ? '👁️‍🗨️' : '👁️'}
                      </button>
                    </div>
                    {errors.confirmNewPassword && (
                      <div style={{ color: '#dc3545', fontSize: '14px', marginTop: '5px' }}>
                        {errors.confirmNewPassword}
                      </div>
                    )}
                  </div>

                  {/* Account Security Info */}
                  <div className="security-field">
                    <label>Trạng thái bảo mật</label>
                    <div style={{
                      padding: '12px 16px',
                      backgroundColor: '#d4edda',
                      border: '1px solid #c3e6cb',
                      borderRadius: '8px',
                      color: '#155724'
                    }}>
                      ✓ Tài khoản được bảo mật
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Error */}
              {errors.submit && (
                <div style={{
                  backgroundColor: '#f8d7da',
                  border: '1px solid #f5c6cb',
                  color: '#721c24',
                  padding: '12px',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  textAlign: 'center'
                }}>
                  {errors.submit}
                </div>
              )}

              {/* Change Password Button */}
              <div className="security-button-container">
                <button 
                  type="submit"
                  className="change-password-button"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Đang xử lý...' : 'Thay đổi mật khẩu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Security;