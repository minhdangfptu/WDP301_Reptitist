import React from 'react';
import { Link } from 'react-router-dom';
import '../css/Footer.css';

const Footer = () => {
  return (
    <footer>
      <div className="container">
        <div className="footer-grid">
          <div className="footer-column">
            <img src="logo1.png" alt="Logo" className="footer-logo" />
            <p>Chăm sóc thú cưng bò sát của bạn một cách tốt nhất</p>
            <div className="social-icons">
              <a href="#" className="social-icon">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="social-icon">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="social-icon">
                <i className="fab fa-instagram"></i>
              </a>
            </div>
          </div>
          
          <div className="footer-column">
            <h3 className="footer-title">Liên kết nhanh</h3>
            <ul className="footer-links">
              <li><Link to="/">Trang chủ</Link></li>
              <li><Link to="/Library">Thư viện</Link></li>
              <li><Link to="/ShopLandingPage">Mua sắm</Link></li>
              <li><Link to="/ContactUs">Liên hệ</Link></li>
            </ul>
          </div>
          
          <div className="footer-column">
            <h3 className="footer-title">Hỗ trợ</h3>
            <ul className="footer-links">
              <li><Link to="/FAQ">FAQ</Link></li>
              <li><Link to="/Privacy">Chính sách bảo mật</Link></li>
              <li><Link to="/Terms">Điều khoản sử dụng</Link></li>
              <li><Link to="/ContactUs">Liên hệ hỗ trợ</Link></li>
            </ul>
          </div>
          
          <div className="footer-column">
            <h3 className="footer-title">Liên hệ</h3>
            <ul className="footer-links">
              <li>Email: support@reptitist.com</li>
              <li>Phone: +84 123 456 789</li>
              <li>Địa chỉ: Beta, Đại học FPT, Thạch Hòa, Thạch Thất, Hà Nội</li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2024 Reptitist. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
