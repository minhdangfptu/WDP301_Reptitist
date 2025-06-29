import React from "react";
import { Link } from "react-router-dom";
import "../css/Footer.css";

const Footer = () => {
  return (
    <footer>
      <div className="container">
        <div className="footer-grid">
          <div className="footer-column">
            <img
              src="/logo1_conen-01-01.png"
              alt="Logo"
              className="footer-logo"
            />
            <p>Chăm sóc thú cưng bò sát của bạn một cách tốt nhất</p>
            <div className="social-icons">
              <a
                href="https://www.facebook.com/profile.php?id=61576867780640"
                className="social-icon"
              >
                <i className="fab fa-facebook-f"></i>
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61576867780640"
                className="social-icon"
              >
                <i className="fab fa-twitter"></i>
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61576867780640"
                className="social-icon"
              >
                <i className="fab fa-instagram"></i>
              </a>
            </div>
          </div>

          <div className="footer-column">
            <h3 className="footer-title">Liên kết nhanh</h3>
            <ul className="footer-links">
              <li>
                <Link to="/">Trang chủ</Link>
              </li>
              <li>
                <Link to="/LibraryTopic">Thư viện</Link>
              </li>
              <li>
                <Link to="/ShopLandingPage">Mua sắm</Link>
              </li>
              <li>
                <Link to="/ContactUs">Liên hệ</Link>
              </li>
            </ul>
          </div>

          <div className="footer-column">
            <h3 className="footer-title">Hỗ trợ</h3>
            <ul className="footer-links">
              <li>
                <Link to="/policy-terms">FAQ</Link>
              </li>
              <li>
                <Link to="/policy-terms">Chính sách bảo mật</Link>
              </li>
              <li>
                <Link to="/policy-terms">Điều khoản sử dụng</Link>
              </li>
              <li>
                <Link to="/ContactUs">Liên hệ hỗ trợ</Link>
              </li>
            </ul>
          </div>

          <div className="footer-column">
            <h3 className="footer-title">Liên hệ</h3>
            <ul className="footer-links">
              <li>
                <Link to="mailto:reptitist.service@gmail.com">
                  Email: reptitist.service@gmail.com
                </Link>
              </li>
              <li>
                <a
                  href="https://zalo.me/84398226650"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Zalo: +84 398226650
                </a>
              </li>
              <li>
                <Link to="https://maps.app.goo.gl/dFaa5sMkuW9gGuE87">
                  Địa chỉ: DELTA, FPTUniversity, Hoa Lac High - Tech Park, Thach
                  That, Ha Noi, Viet Nam
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2025 Reptitist. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
