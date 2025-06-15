/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ReactPlayer from "react-player";

const LandingPage = () => {
  return (
    <>
      <Header />

      <section className="hero">
        <div className="container">
          <div
            className="hero-content "
            style={{
              textAlign: "left",
              position: "relative",
              left: "0%",
              padding: "0px",
              maxWidth: "448px",
              transform: "none",
            }}
          >
            <h1 className="hero-title">
              BIẾN CHĂM SÓC BÒ SÁT THÀNH NIỀM VUI MỖI NGÀY CÙNG REPTISIST
            </h1>
            <p className="hero-description">
              Website chăm sóc bò sát cung cấp Chatbot AI 24/7, thư viện kiến
              thức phong phú, hồ sơ cá nhân hóa, và kết nối cộng đồng giúp bạn
              chăm sóc bò sát dễ dàng. Hệ sinh thái toàn diện hỗ trợ khám bệnh
              và mua sắm sản phẩm chất lượng. Chăm sóc bò sát chưa bao giờ dễ
              dàng hơn!
            </p>
            <div className="hero-buttons">
              <a href="#" className="btn btn-primary">KHÁM PHÁ NGAY!</a>
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
          <h2 style={{ textAlign: "center", justifyContent: "center" }}>
            Nền tảng chăm sóc bò sát toàn diện
          </h2>
          <h3
            style={{
              textAlign: "center",
              justifyContent: "center",
              fontWeight: "700px",
              fontSize: "2rem",
              color: "#0fa958",
            }}
          >
            REPTIEST
          </h3>

          <div className="about-flex">
            <div className="about-content">
              <p>
                Reptitist tự hào là nền tảng chăm sóc bò sát hàng đầu tại Việt
                Nam, tiên phong trong việc cung cấp các giải pháp toàn diện và
                chuyên sâu dành cho các loài bò sát cảnh.
                <br></br>Với sứ mệnh nâng cao chất lượng cuộc sống và sức khỏe
                cho những người bạn bò sát của bạn, chúng tôi tập trung phát
                triển đa dạng các dịch vụ chất lượng cao, từ cung cấp bộ công cụ
                chăm sóc chuyên nghiệp đến ứng dụng công nghệ trí tuệ nhân tạo
                (AI) hiện đại
              </p>
              <p>
                Chúng tôi tự hào mang đến những trải nghiệm tốt nhất, được khách
                hàng tin tưởng và đánh giá cao, trở thành lựa chọn ưu tiên cho
                cộng đồng yêu bò sát tại Việt Nam.
              </p>
            </div>
            <div className="about-image">
              {/* <img src="BGLandingPage.png" alt="Bò sát tại Reptiest" /> */}
              <ReactPlayer playing={true} muted={true} url="https://www.youtube.com/watch?v=KYPKoT8C5TA" controls width="100%" />
              {/* <div className="play-button"></div> */}
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2 className="section-title">KHÁM PHÁ CÙNG CHÚNG TÔI</h2>
          <div className="features-grid">
            {[
              "THƯ VIỆN KIẾN THỨC",
              "CÁ NHÂN HÓA CÙNG AI",
              "TƯ VẤN CHUYÊN SÂU",
              "MUA SẮM THỎA THÍCH",
            ].map((title, i) => {
              const images = [
                "/landing_library.jpg",
                "/landing_ai.webp",
                "/landing_axo.jpg",
                "/landing_shop.jpg",
              ];
              return (
                <div className="feature-card" key={i}>
                  <img src={images[i]} alt={title} />
                  <div className="feature-content">
                    <h3
                      className="feature-title"
                      style={{ textAlign: "center", justifyContent: "center" }}
                    >
                      {title}
                    </h3>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="news">
        <div className="container">
          <h2 className="section-title">THÔNG TIN VÀ CẬP NHẬT</h2>
          <div className="news-grid">
            <div className="featured-news">
              <div className="featured-news-image">
                <img src="/landing_rua.jpg" alt="Tắc kè hoa" />
              </div>
              <div className="featured-news-content">
                <h3 className="news-title">CÓ NÊN TẮM CHO RÙA VÀO MÙA ĐÔNG?</h3>
                <p className="news-excerpt">
                  Thông thường, bạn không cần phải tắm cho rùa trong mùa đông,
                  vì trong thời gian này, rùa thường sẽ bước vào trạng thái "ngủ
                  đông" (hibernate) hoặc giảm hoạt động. Việc tắm cho rùa vào
                  mùa đông có thể gây căng thẳng cho chúng, đặc biệt nếu nước
                  tắm quá lạnh hoặc không thích hợp với nhiệt độ cơ thể của
                  chúng
                </p>
                <a href="#" className="btn btn-primary" style={{backgroundColor: "#0fa958", borderRadius:"30px"}}>
                  Xem thêm
                </a>
              </div>
            </div>

            <div className="recent-news">
              {[
                "Quy trình khử trùng cho bò sát",
                "Các loại thức ăn cho bò sát đặc biệt",
                "Cạo vôi và vệ sinh răng cho bò sát",
                "12 lưu ý quan trọng khi nuôi bò sát",
              ].map((title, i) => (
                <div className="news-item" key={i}>
                  <div className="news-item-image">
                    <img src="/landing_bosat.jpg" alt="Bò sát" />
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
