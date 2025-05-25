import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";

const Header = () => {
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const accountRef = useRef(null);

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

  return (
    <header>
      <div className="container">
        <nav>
            <img
              src="logo1.png"
              className="logo"
            />
          <ul className="nav-links">
            <li><Link to="/LandingPage">TRANG CHỦ</Link></li>
            <li><Link to="/Community">CỘNG ĐỒNG</Link></li>
            <li><Link to="/Library">THƯ VIỆN</Link></li>
            <li><Link to="/Shop">MUA SẮM</Link></li>
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
                <li><Link to="/Login">Login</Link></li>
                <li><Link to="/Logout">Logout</Link></li>
                <li><Link to="/Signup">Sign Up</Link></li>
                <li><Link to="/Profile">Profile</Link></li>
              </ul>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
