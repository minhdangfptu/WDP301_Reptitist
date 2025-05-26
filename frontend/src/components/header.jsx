import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../css/Header.css";

const Header = () => {
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const accountRef = useRef(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
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
            {user?.role === 'admin' && <li><Link to="/UserList">QUẢN LÝ</Link></li>}
          </ul>

          {/* Account menu with dropdown */}
          <div
            className="btn account-menu-wrapper"
            ref={accountRef}
            onClick={() => setShowAccountMenu((prev) => !prev)}
            style={{ cursor: "pointer", userSelect: "none" }}
          >
            {user ? user.username : 'Tài khoản'}
            {showAccountMenu && (
              <ul className="account-dropdown">
                {!user ? (
                  <>
                    <li><Link to="/Login">Đăng nhập</Link></li>
                    <li><Link to="/SignUp">Đăng ký</Link></li>
                  </>
                ) : (
                  <>
                    <li><Link to="/Profile">Hồ sơ</Link></li>
                    <li><Link to="/Security">Bảo mật</Link></li>
                    <li><Link to="/Settings">Cài đặt</Link></li>
                    <li onClick={handleLogout} style={{ cursor: "pointer" }}>
                      Đăng xuất
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
