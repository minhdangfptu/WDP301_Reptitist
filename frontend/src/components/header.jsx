import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../css/Header.css";
import "../css/common.css";
import "../css/common.css";

const Header = () => {
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const accountRef = useRef(null);
  const { user, logout, hasRole, hasAnyRole } = useAuth();
  const navigate = useNavigate();

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

  return (
    <header style={{position: 'static', width: '100%', zIndex: '1000'}} className="header">
      <div className="container">
        <nav className="header__nav">
        <nav className="header__nav">
          <Link to="/">
            <img
            style={{width: '135px',height: 'auto',  justifyContent: 'center', content: 'center', marginBottom: '0px', marginTop: '0px'}}
              src="/logo1.png"
              className="header__logo"
              alt="Logo"
            />
          </Link>
          <ul className="header__nav-links">
            <li><Link to="/" className="header__nav-link">TRANG CHỦ</Link></li>
            <li><Link to="/Community" className="header__nav-link">CỘNG ĐỒNG</Link></li>
            <li><Link to="/LibraryTopic" className="header__nav-link">THƯ VIỆN</Link></li>
            <li><Link to="/ShopLandingPage" className="header__nav-link">MUA SẮM</Link></li>
            <li><Link to="/ContactUs" className="header__nav-link">LIÊN HỆ</Link></li>
            {user && <li><Link to="/YourPet" className="header__nav-link">YOUR PET</Link></li>}
          </ul>

          <div
            className="header__account-menu"
            className="header__account-menu"
            ref={accountRef}
            onClick={() => setShowAccountMenu(!showAccountMenu)}
            onClick={() => setShowAccountMenu(!showAccountMenu)}
          >
            <div className="header__account-menu-text">
              <span>{user ? (user.fullname || user.username) : 'Tài khoản'}</span>
              <span className={`header__caret ${showAccountMenu ? 'header__caret--up' : ''}`}>
                ▼
              </span>
            </div>
            <div className="header__account-menu-text">
              <span>{user ? (user.fullname || user.username) : 'Tài khoản'}</span>
              <span className={`header__caret ${showAccountMenu ? 'header__caret--up' : ''}`}>
                ▼
              </span>
            </div>
            
            {showAccountMenu && (
              <div className="header__dropdown">
              <div className="header__dropdown">
                {!user ? (
                  <>
                    <Link to="/Login" className="header__dropdown-item" onClick={() => setShowAccountMenu(false)}>
                      Đăng nhập
                    </Link>
                    <Link to="/SignUp" className="header__dropdown-item" onClick={() => setShowAccountMenu(false)}>
                      Đăng ký
                    </Link>
                    <Link to="/Login" className="header__dropdown-item" onClick={() => setShowAccountMenu(false)}>
                      Đăng nhập
                    </Link>
                    <Link to="/SignUp" className="header__dropdown-item" onClick={() => setShowAccountMenu(false)}>
                      Đăng ký
                    </Link>
                  </>
                ) : (
                  <>
                    <div className="header__dropdown-header">
                      Xin chào, {user.fullname || user.username}!
                    </div>
                    <Link to="/Profile" className="header__dropdown-item" onClick={() => setShowAccountMenu(false)}>
                      Hồ sơ
                    </Link>
                    <Link to="/Security" className="header__dropdown-item" onClick={() => setShowAccountMenu(false)}>
                      Bảo mật
                    </Link>
                    <Link to="/Settings" className="header__dropdown-item" onClick={() => setShowAccountMenu(false)}>
                      Cài đặt
                    </Link>
                    <Link to="/Transaction" className="header__dropdown-item" onClick={() => setShowAccountMenu(false)}>
                      Giao dịch
                    </Link>
                    
                    <div className="header__dropdown-header">
                      Xin chào, {user.fullname || user.username}!
                    </div>
                    <Link to="/Profile" className="header__dropdown-item" onClick={() => setShowAccountMenu(false)}>
                      Hồ sơ
                    </Link>
                    <Link to="/Security" className="header__dropdown-item" onClick={() => setShowAccountMenu(false)}>
                      Bảo mật
                    </Link>
                    <Link to="/Settings" className="header__dropdown-item" onClick={() => setShowAccountMenu(false)}>
                      Cài đặt
                    </Link>
                    <Link to="/Transaction" className="header__dropdown-item" onClick={() => setShowAccountMenu(false)}>
                      Giao dịch
                    </Link>
                    
                    {hasRole('admin') && (
                      <Link to="/UserManagement" className="header__dropdown-item" onClick={() => setShowAccountMenu(false)}>
                        Quản lý người dùng
                      </Link>
                      <Link to="/UserManagement" className="header__dropdown-item" onClick={() => setShowAccountMenu(false)}>
                        Quản lý người dùng
                      </Link>
                    )}
                    
                    {hasAnyRole(['shop', 'admin']) && (
                      <>
                        <Link to="/ShopDashboard" className="header__dropdown-item" onClick={() => setShowAccountMenu(false)}>
                          Dashboard Shop
                        </Link>
                        <Link to="/ProductManagement" className="header__dropdown-item" onClick={() => setShowAccountMenu(false)}>
                          Quản lý sản phẩm
                        </Link>
                      </>
                    )}
                    
                    <div 
                      className="header__dropdown-logout"
                      onClick={() => {
                        handleLogout();
                        setShowAccountMenu(false);
                      }}
                    >
                      Đăng xuất
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;