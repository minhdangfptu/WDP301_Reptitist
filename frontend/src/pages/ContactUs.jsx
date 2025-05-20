import React, { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";


const ContactUs = () => (
  <>
    <Header />

    <div className="page-title">
      <div className="container">
        <h1>LIÊN HỆ</h1>
      </div>
    </div>

    <section className="contact-section">
      <div className="container">
        <div className="contact-content">
          <div className="contact-info">
            <h2>Liên hệ với chúng tôi</h2>
            <p>Chúng tôi luôn sẵn sàng lắng nghe mọi ý kiến đóng góp của bạn để phát triển dịch vụ ngày càng tốt hơn.</p>
            <div className="social-icons">
              <a href="#" className="social-icon"><i className="fab fa-facebook-f"></i></a>
              <a href="#" className="social-icon"><i className="fab fa-instagram"></i></a>
              <a href="#" className="social-icon"><i className="fab fa-youtube"></i></a>
              <a href="#" className="social-icon"><i className="fab fa-tiktok"></i></a>
            </div>
          </div>
          <div className="contact-form">
            <form>
              <div className="form-group">
                <input type="text" className="form-control" placeholder="Tên của bạn" />
              </div>
              <div className="form-group">
                <input type="email" className="form-control" placeholder="Email" />
              </div>
              <div className="form-group">
                <input type="tel" className="form-control" placeholder="Số điện thoại" />
              </div>
              <div className="form-group">
                <input type="text" className="form-control" placeholder="Tiêu đề" />
              </div>
              <div className="form-group">
                <textarea className="form-control" placeholder="Nội dung" />
              </div>
              <button type="submit" className="btn-submit">GỬI Ý KIẾN</button>
            </form>
          </div>
        </div>
      </div>
    </section>

    <section className="map-section">
      <div className="container">
        <div className="map-container">
          <img src="/api/placeholder/1200/300" alt="Bản đồ" />
          <div className="contact-cards">
            <div className="contact-card">
              <div className="card-icon"><i className="fas fa-map-marker-alt"></i></div>
              <div className="card-content">
                <h3>Địa chỉ của tôi</h3>
                <p>88 TA, Hai Bà Trưng, Hà Nội</p>
              </div>
            </div>
            <div className="contact-card">
              <div className="card-icon"><i className="fas fa-phone-alt"></i></div>
              <div className="card-content">
                <h3>Số điện thoại</h3>
                <p>0987654321</p>
              </div>
            </div>
            <div className="contact-card">
              <div className="card-icon"><i className="fas fa-envelope"></i></div>
              <div className="card-content">
                <h3>Email</h3>
                <p>info@reptisist.vn</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <Footer />
  </>
);

export default ContactUs;
