import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Header = () => {
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const accountRef = useRef(null);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  // Đóng menu khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (accountRef.current && !accountRef.current.contains(event.target)) {
        setShowAccountMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Xử lý logout
  const handleLogout = async () => {
    await logout();
    setShowAccountMenu(false);
    navigate("/");
  };

  return (
    <header>
      <div className="container">
        <nav>
          <img
            src="logo1.png"
            className="logo"
            alt="Logo"
          />
          <ul className="nav-links">
            <li><Link to="/">TRANG CHỦ</Link></li>
            <li><Link to="/Community">CỘNG ĐỒNG</Link></li>
            <li><Link to="/Library">THƯ VIỆN</Link></li>
            <li><Link to="/ShopLandingPage">MUA SẮM</Link></li>
            <li><Link to="/ContactUs">Liên hệ</Link></li>
            <li><Link to="/YourPet">YOUR PET</Link></li>
          </ul>

          {/* Phần tài khoản với dropdown */}
          <div
            className="btn account-menu-wrapper"
            ref={accountRef}
            onClick={() => setShowAccountMenu((prev) => !prev)}
            style={{ cursor: "pointer", userSelect: "none" }}
          >
            Tài khoản
            {showAccountMenu && (
              <ul className="account-dropdown">
                {!user && <li><Link to="/Login">Login</Link></li>}
                {user && (
                  <>
                    <li>
                      <span
                        onClick={handleLogout}
                        style={{ cursor: "pointer" }}
                      >
                        Logout
                      </span>
                    </li>
                    <li><Link to="/Profile">Profile</Link></li>
                  </>
                )}
                {!user && <li><Link to="/Signup">Sign Up</Link></li>}
              </ul>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
