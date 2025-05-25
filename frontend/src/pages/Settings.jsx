import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import NavigationBar from '../components/NavigationBar';
import { useTheme } from '../context/ThemeContext';
import '../css/Settings.css';
import '../css/dark-mode.css';

const Settings = () => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [systemNotifications, setSystemNotifications] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('vietnamese');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { darkMode, toggleDarkMode } = useTheme();

  const handleDeleteAccount = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    // Logic xóa tài khoản
    console.log('Deleting account...');
    setShowDeleteConfirm(false);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

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

            {/* Settings Content */}
            <div className="settings-content">
              
              {/* Cài đặt thông báo */}
              <div className="settings-section">
                <h3 className="settings-section-title">Cài đặt thông báo</h3>
                <div className="settings-items">
                  <div className="settings-item">
                    <div className="settings-item-info">
                      <span className="settings-item-title">Nhận thông báo email</span>
                      <span className="settings-item-description">Nhận email về cập nhật tài khoản và khuyến mãi</span>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={emailNotifications}
                        onChange={(e) => setEmailNotifications(e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="settings-item">
                    <div className="settings-item-info">
                      <span className="settings-item-title">Nhận thông báo đẩy từ hệ thống</span>
                      <span className="settings-item-description">Thông báo trên trình duyệt về hoạt động quan trọng</span>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={systemNotifications}
                        onChange={(e) => setSystemNotifications(e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Ngôn ngữ & giao diện */}
              <div className="settings-section">
                <h3 className="settings-section-title">Ngôn ngữ & giao diện</h3>
                <div className="settings-items">
                  <div className="settings-item">
                    <div className="settings-item-info">
                      <span className="settings-item-title">Lựa chọn ngôn ngữ</span>
                      <span className="settings-item-description">Thay đổi ngôn ngữ hiển thị của ứng dụng</span>
                    </div>
                    <select
                      className="settings-select"
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                    >
                      <option value="vietnamese">Tiếng Việt</option>
                      <option value="english">English</option>
                      <option value="chinese">中文</option>
                      <option value="japanese">日本語</option>
                    </select>
                  </div>

                  <div className="settings-item">
                    <div className="settings-item-info">
                      <span className="settings-item-title">Chế độ sáng / tối (Dark mode)</span>
                      <span className="settings-item-description">Bật chế độ tối để bảo vệ mắt khi sử dụng ban đêm</span>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={darkMode}
                        onChange={toggleDarkMode}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Xóa hoặc khóa tài khoản */}
              <div className="settings-section danger-section">
                <h3 className="settings-section-title danger-title">Xóa hoặc khóa tài khoản</h3>
                <div className="settings-items">
                  <div className="settings-item danger-item">
                    <div className="settings-item-info">
                      <span className="settings-item-title danger-text">Yêu cầu tạm ngưng / xóa vĩnh viễn tài khoản</span>
                      <span className="settings-item-description">Hành động này không thể hoàn tác. Tất cả dữ liệu sẽ bị xóa vĩnh viễn.</span>
                    </div>
                    <button
                      className="delete-button"
                      onClick={handleDeleteAccount}
                    >
                      Xóa tài khoản
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Xác nhận xóa tài khoản</h3>
            <p>Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác.</p>
            <div className="modal-buttons">
              <button className="cancel-button" onClick={cancelDelete}>
                Hủy bỏ
              </button>
              <button className="confirm-delete-button" onClick={confirmDelete}>
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default Settings;