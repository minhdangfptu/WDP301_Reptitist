import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../css/NavigationBar.css';

const NavigationBar = () => {
  const [activeItem, setActiveItem] = useState('personal');
  const navigate = useNavigate();

  const handleMenuClick = (itemId, path) => {
    setActiveItem(itemId);
    navigate(path);
  };

  return (
    <div className="navigation-container">
      <div className="navigation-content">
        <nav className="navigation-menu">
          {/* Cá nhân - Personal/Profile Icon */}
          <div className={`menu-item ${activeItem === 'personal' ? 'active' : ''}`}
               onClick={() => handleMenuClick('personal', '/Profile')}>
            <div className="menu-icon-wrapper">
              <svg className="menu-icon" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
              </svg>
            </div>
            <span className="menu-text">Cá nhân</span>
          </div>

          {/* Bảo mật - Security/Shield Icon */}
          <div className={`menu-item ${activeItem === 'security' ? 'active' : ''}`}
               onClick={() => handleMenuClick('security', '/Security')}>
            <div className="menu-icon-wrapper">
              <svg className="menu-icon" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="menu-text">Bảo mật</span>
          </div>

          {/* Nâng cấp tài khoản - Upgrade/Star Icon */}
          <div className={`menu-item ${activeItem === 'upgrade' ? 'active' : ''}`}
               onClick={() => handleMenuClick('upgrade', '/PlanUpgrade')}>
            <div className="menu-icon-wrapper">
              <svg className="menu-icon" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <span className="menu-text">Nâng cấp tài khoản</span>
          </div>

          {/* Giao dịch - Transaction/Money Icon */}
          <div className={`menu-item ${activeItem === 'transaction' ? 'active' : ''}`}
               onClick={() => handleMenuClick('transaction', '/Transaction')}>
            <div className="menu-icon-wrapper">
              <svg className="menu-icon" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="menu-text">Giao dịch</span>
          </div>

          {/* Cài đặt - Settings/Gear Icon */}
          <div className={`menu-item ${activeItem === 'settings' ? 'active' : ''}`}
               onClick={() => handleMenuClick('settings', '/Settings')}>
            <div className="menu-icon-wrapper">
              <svg className="menu-icon" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="menu-text">Cài đặt</span>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default NavigationBar;