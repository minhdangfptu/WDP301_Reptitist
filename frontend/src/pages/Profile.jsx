import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import NavigationBar from '../components/NavigationBar';
import '../css/Profile.css';

const Profile = () => {
  return (
    <>
      <Header />
      <div className="profile-layout">
        {/* Sử dụng NavigationBar component thay vì sidebar đơn giản */}
        <NavigationBar />
        
        <div className="profile-container">
          {/* Welcome Header */}
          <div className="welcome-header">
            <div className="welcome-content">
              <h1>Xin chào, Minh Đăng</h1>
              <p>THỨ 3, 20/05/2025</p>
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
                    src="/api/placeholder/64/64"
                    alt="Profile"
                  />
                </div>
                <div className="profile-user-details">
                  <h2>mangdinh_buonngu</h2>
                  <div className="profile-badge-container">
                    <span className="profile-badge-text">Premium Customer</span>
                    <button className="upgrade-button">
                      Upgrade account
                    </button>
                  </div>
                </div>
              </div>
              <button className="edit-button">
                Chỉnh sửa
              </button>
            </div>

            {/* Profile Information Grid */}
            <div className="profile-grid">
              {/* Left Column */}
              <div className="profile-column">
                <div className="profile-field">
                  <label>Tên đầy đủ</label>
                  <p>Minh Đăng</p>
                </div>

                <div className="profile-field">
                  <label>Email</label>
                  <p>minhmeomeo@gmail.com</p>
                </div>

                <div className="profile-field">
                  <label>Số điện thoại</label>
                  <p>0987654321</p>
                </div>
              </div>

              {/* Right Column */}
              <div className="profile-column">
                <div className="profile-field">
                  <label>Địa chỉ</label>
                  <p>Đất thổ cư Hòa Lạc, Thạch Thất, Hà Nội</p>
                </div>

                <div className="profile-field wallet">
                  <label>Wallet</label>
                  <p>50000 VND</p>
                </div>

                <div className="profile-field">
                  <label>Trạng thái tài khoản</label>
                  <span className="status-badge">
                    Đang hoạt động
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
                    <p>Minh Đăng - 0398826650</p>
                    <p>Đất thổ cư Hòa Lạc, Thạch Thất, Hà Nội</p>
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