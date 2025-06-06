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
            <h1 className="hero-title">
              BIẾN CHĂM SÓC BÒ SÁT THÀNH NIỀM VUI MỖI NGÀY CÙNG REPTISIST
            </h1>
            <p className="hero-description">
              Website chăm sóc bò sát cung cấp Chatbot AI 24/7, thư viện kiến thức phong phú, hồ sơ cá nhân hóa, và kết nối cộng đồng giúp bạn chăm sóc bò sát dễ dàng. Hệ sinh thái toàn diện hỗ trợ khám bệnh và mua sắm sản phẩm chất lượng. Chăm sóc bò sát chưa bao giờ dễ dàng hơn!
            </p>
            <div className="hero-buttons">
              <a href="#" className="btn btn-primary">KHÁM PHÁ NGAY</a>
              <a href="/PlanUpgrade" className="btn btn-secondary">CÁC GÓI DỊCH VỤ</a>
            </div>
          </div>
          <div className="discount-badge">
              <span className="amount">30%</span>
              <span>OFF</span>
            </div>
        </div>
      </section>


      <section className="about">
        <div className="container">
          <h2>Nền tảng chăm sóc bò sát toàn diện</h2>
          <h3 className="about-title1">REPTIEST</h3>
          <div className="about-flex">
            <div className="about-content">
              <p>Reptitist tự hào là nền tảng chăm sóc bò sát hàng đầu tại Việt Nam. Chúng tôi chuyên cung cấp đa dạng các dịch vụ chất lượng cao dành cho bò sát cảnh, bao gồm bộ công cụ chăm sóc chuyên nghiệp, áp dụng trí tuệ nhân tạo AI </p>
              <p>Chúng tôi tự hào mang đến những trải nghiệm tốt nhất, được khách hàng tin tưởng và đánh giá cao, trở thành lựa chọn ưu tiên cho cộng đồng yêu bò sát tại Việt Nam.</p>
            </div>
            <div className="about-image">
              <img src="BGLandingPage.png" alt="Bò sát tại Reptiest" />
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
                <img src={`BGLandingPage.png`} alt={title} />
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
                <p className="news-excerpt">Thông thường, bạn không cần phải tắm cho rùa trong mùa đông, vì trong thời gian này, rùa thường sẽ bước vào trạng thái "ngủ đông" (hibernate) hoặc giảm hoạt động. Việc tắm cho rùa vào mùa đông có thể gây căng thẳng cho chúng, đặc biệt nếu nước tắm quá lạnh hoặc không thích hợp với nhiệt độ cơ thể của chúng</p>
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