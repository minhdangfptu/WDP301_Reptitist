import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import NavigationBar from '../components/NavigationBar';
import { useAuth } from '../context/AuthContext';
import '../css/Profile.css';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    fullname: '',
    phone_number: '',
    address: ''
  });

  useEffect(() => {
    if (user) {
      setEditForm({
        fullname: user.fullname || '',
        phone_number: user.phone_number || '',
        address: user.address || ''
      });
    }
  }, [user]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    // Update user data locally (in a real app, you'd also update on the server)
    updateUser(editForm);
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (user) {
      setEditForm({
        fullname: user.fullname || '',
        phone_number: user.phone_number || '',
        address: user.address || ''
      });
    }
    setIsEditing(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
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

  const formatBalance = (balance) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(balance || 0);
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
                <p>Bạn cần đăng nhập để xem thông tin profile</p>
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
              <button className="edit-button" onClick={isEditing ? handleSave : handleEdit}>
                {isEditing ? 'Lưu' : 'Chỉnh sửa'}
              </button>
              {isEditing && (
                <button 
                  className="edit-button" 
                  onClick={handleCancel}
                  style={{ marginLeft: '10px', backgroundColor: '#6b7280' }}
                >
                  Hủy
                </button>
              )}
            </div>

            {/* Profile Information Grid */}
            <div className="profile-grid">
              {/* Left Column */}
              <div className="profile-column">
                <div className="profile-field">
                  <label>Tên đầy đủ</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="fullname"
                      value={editForm.fullname}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '16px'
                      }}
                    />
                  ) : (
                    <p>{user.fullname || 'Chưa cập nhật'}</p>
                  )}
                </div>

                <div className="profile-field">
                  <label>Email</label>
                  <p>{user.email}</p>
                </div>

                <div className="profile-field">
                  <label>Số điện thoại</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone_number"
                      value={editForm.phone_number}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '16px'
                      }}
                    />
                  ) : (
                    <p>{user.phone_number || 'Chưa cập nhật'}</p>
                  )}
                </div>
              </div>

              {/* Right Column */}
              <div className="profile-column">
                <div className="profile-field">
                  <label>Địa chỉ</label>
                  {isEditing ? (
                    <textarea
                      name="address"
                      value={editForm.address}
                      onChange={handleInputChange}
                      rows="3"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '16px',
                        resize: 'vertical'
                      }}
                    />
                  ) : (
                    <p>{user.address || 'Chưa cập nhật'}</p>
                  )}
                </div>

                <div className="profile-field wallet">
                  <label>Wallet</label>
                  <p>{formatBalance(user.wallet?.balance)}</p>
                </div>

                <div className="profile-field">
                  <label>Trạng thái tài khoản</label>
                  <span className="status-badge">
                    {user.isActive ? 'Đang hoạt động' : 'Không hoạt động'}
                  </span>
                </div>
              </div>
            </div>

            {/* Delivery Information Section */}
            <div className="delivery-section">
              <h3 className="delivery-title">Thông tin nhận hàng</h3>
              
              <div className="delivery-info">
                <div className="delivery-content">
                  <div className="delivery-icon">
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                  <div className="delivery-details">
                    <p>{user.fullname || user.username} - {user.phone_number || 'Chưa có SĐT'}</p>
                    <p>{user.address || 'Chưa cập nhật địa chỉ'}</p>
                  </div>
                </div>
              </div>

              <button className="add-info-button">
                <span>+</span>
                thông tin nhận
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Profile;