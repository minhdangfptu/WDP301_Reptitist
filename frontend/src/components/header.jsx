import React, { useState, useRef, useEffect } from "react";

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
            src="Screenshot 2025-05-20 072648.png"
            alt="Reptiest Logo"
            className="logo"
          />
          <ul className="nav-links">
            <li><a href="LandingPage">TRANG CHỦ</a></li>
            <li><a href="#">CỘNG ĐỒNG</a></li>
            <li><a href="Library">THƯ VIỆN </a></li>
            <li><a href="#">MUA SẮM </a></li>
            <li><a href="ContactUs">Liên hệ</a></li>
            <li><a href="#">YOUR PET</a></li>
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
                <li><a href="/Login">Login</a></li>
                <li><a href="/Logout">Logout</a></li>
                <li><a href="/SignUp">Sign Up</a></li>
              </ul>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
