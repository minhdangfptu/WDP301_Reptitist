import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../css/Header.css";

const Header = () => {
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const accountRef = useRef(null);
  const { user, logout, hasRole, hasAnyRole } = useAuth();
  const navigate = useNavigate();

  // Debug: Log user state changes
  useEffect(() => {
    console.log("Header - User state changed:", user);
  }, [user]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (accountRef.current && !accountRef.current.contains(event.target)) {
        setShowAccountMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setShowAccountMenu(false);
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleAccountMenuClick = () => {
    setShowAccountMenu((prev) => !prev);
  };

  return (
    <header>
      <div className="container">
        <nav>
          <Link to="/">
            <img
              src="logo1.png"
              className="logo"
              alt="Logo"
            />
          </Link>
          <ul className="nav-links">
            <li><Link to="/">TRANG CHỦ</Link></li>
            <li><Link to="/Community">CỘNG ĐỒNG</Link></li>
            <li><Link to="/Library">THƯ VIỆN</Link></li>
            <li><Link to="/ShopLandingPage">MUA SẮM</Link></li>
            <li><Link to="/ContactUs">Liên hệ</Link></li>
            {user && <li><Link to="/YourPet">YOUR PET</Link></li>}
          </ul>

          {/* Account menu with dropdown */}
          <div
            className="btn account-menu-wrapper"
            ref={accountRef}
            onClick={handleAccountMenuClick}
            style={{ cursor: "pointer", userSelect: "none" }}
          >
            {/* Hiển thị tên user hoặc "Tài khoản" */}
            <span>
              {user ? (user.fullname || user.username) : 'Tài khoản'}
            </span>
            <span className={`caret ${showAccountMenu ? "caret-up" : "caret-down"}`}></span>
            
            {showAccountMenu && (
              <ul className="account-dropdown">
                {!user ? (
                  // Menu khi chưa đăng nhập
                  <>
                    <li><Link to="/Login" onClick={() => setShowAccountMenu(false)}>Đăng nhập</Link></li>
                    <li><Link to="/SignUp" onClick={() => setShowAccountMenu(false)}>Đăng ký</Link></li>
                  </>
                ) : (
                  // Menu khi đã đăng nhập
                  <>
                    <li>
                      <div style={{ padding: '10px 15px', borderBottom: '1px solid #eee', fontSize: '12px', color: '#666' }}>
                        Xin chào, {user.fullname || user.username}!
                      </div>
                    </li>
                    <li><Link to="/Profile" onClick={() => setShowAccountMenu(false)}>Hồ sơ</Link></li>
                    <li><Link to="/Security" onClick={() => setShowAccountMenu(false)}>Bảo mật</Link></li>
                    <li><Link to="/Settings" onClick={() => setShowAccountMenu(false)}>Cài đặt</Link></li>
                    <li><Link to="/Transaction" onClick={() => setShowAccountMenu(false)}>Giao dịch</Link></li>
                    {/* Admin specific menu items */}
                    {hasRole('admin') && (
                      <>
                        <li><Link to="/UserManagement" onClick={() => setShowAccountMenu(false)}>Quản lý người dùng</Link></li>
                      </>
                    )}
                    {/* Shop owner specific menu items */}
                    {hasAnyRole(['shop', 'admin']) && (
                      <>
                        <li><Link to="/ShopDashboard" onClick={() => setShowAccountMenu(false)}>Dashboard Shop</Link></li>
                        <li><Link to="/ProductManagement" onClick={() => setShowAccountMenu(false)}>Quản lý sản phẩm</Link></li>
                      </>
                    )}
                    <li>
                      <div 
                        onClick={() => {
                          handleLogout();
                          setShowAccountMenu(false);
                        }} 
                        style={{ 
                          cursor: "pointer", 
                          padding: '10px 15px',
                          borderTop: '1px solid #eee',
                          color: '#dc3545'
                        }}
                      >
                        Đăng xuất
                      </div>
                    </li>
                  </>
                )}
              </ul>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;