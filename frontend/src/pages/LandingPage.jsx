/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";


const LandingPage = () => {
  return (
    <>
      <Header />

      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">ĐIỀU CHĂM SÓC BÒ SÁT THÀNH NIỀM VUI MỖI NGÀY CÙNG REPTIEST</h1>
            <a href="#" className="btn">Tìm hiểu thêm</a>
          </div>
          <div className="discount-badge">
            <span className="amount">30%</span>
            <span>OFF</span>
          </div>
        </div>
      </section>

      <section className="about">
        <div className="container">
          <h2>Hiểu tổng chăm sóc bò sát hoàn diễn</h2>
          <h3>REPTIEST</h3>
          <div className="about-flex">
            <div className="about-content">
              <p>Reptiest là trung tâm chuyên về bò sát hàng đầu tại Hà Nội...</p>
              <p>Chúng tôi tự hào mang đến những loài bò sát khỏe mạnh...</p>
            </div>
            <div className="about-image">
              <img src="/api/placeholder/500/300" alt="Bò sát tại Reptiest" />
              <div className="play-button"></div>
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2 className="section-title">KHÁM PHÁ CÙNG CHÚNG TÔI</h2>
          <div className="features-grid">
            {["CHĂM SÓC THÚ CƯNG", "THỨC ĂN ĐẶC BIỆT", "TƯ VẤN CHUYÊN SÂU", "PHỤ KIỆN CHĂM SÓC"].map((title, i) => (
              <div className="feature-card" key={i}>
                <img src={`/api/placeholder/300/180`} alt={title} />
                <div className="feature-content">
                  <h3 className="feature-title">{title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="news">
        <div className="container">
          <h2 className="section-title">TIN TỨC & SỰ KIỆN</h2>
          <div className="news-grid">
            <div className="featured-news">
              <div className="featured-news-image">
                <img src="/api/placeholder/400/300" alt="Tắc kè hoa" />
              </div>
              <div className="featured-news-content">
                <h3 className="news-title">CÓ NÊN TẮM CHO RÙA VÀO MÙA ĐÔNG?</h3>
                <p className="news-excerpt">Vào mùa đông, tắm cho rùa là việc làm cần thiết...</p>
                <a href="#" className="btn">Xem thêm</a>
              </div>
            </div>

            <div className="recent-news">
              {["Quy trình khử trùng cho bò sát", "Các loại thức ăn cho bò sát đặc biệt", "Cạo vôi và vệ sinh răng cho bò sát", "12 lưu ý quan trọng khi nuôi bò sát"].map((title, i) => (
                <div className="news-item" key={i}>
                  <div className="news-item-image">
                    <img src="/api/placeholder/80/80" alt="Bò sát" />
                  </div>
                  <div>
                    <h4 className="news-item-title">{title}</h4>
                    <p className="news-date">{`0${i + 1}/05/2023`}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default LandingPage;