import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import NavigationBar from '../components/NavigationBar';
import '../css/Security.css';

const Security = () => {
  return (
    <>
      <Header />
      <div className="profile-layout">
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
            </div>

            {/* Security Title */}
            <div className="security-title">
              <h2>Bảo mật</h2>
            </div>

            {/* Security Information Grid */}
            <div className="security-grid">
              {/* Left Column */}
              <div className="security-column">
                <div className="security-field">
                  <label>Mật khẩu hiện tại</label>
                  <p>Minh Đăng</p>
                </div>

                <div className="security-field">
                  <label>Mật khẩu mới</label>
                  <p>minhmeomeo@gmail.com</p>
                </div>
              </div>

              {/* Right Column */}
              <div className="security-column">
                <div className="security-field">
                  <label>Xác nhận mật khẩu mới</label>
                  <p>50000 VND</p>
                </div>
              </div>
            </div>

            {/* Change Password Button */}
            <div className="security-button-container">
              <button className="change-password-button">
                Change password
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Security;