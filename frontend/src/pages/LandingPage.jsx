/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import ReactPlayer from "react-player";
import { useAuth } from "../context/AuthContext.jsx";
import { Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
import { baseUrl } from "../config.js";
import "../css/LandingPage.css";
import SupportButton from "../components/SupportButton.jsx";

const LandingPage = () => {
  const [top1LatestContents, setTop1LatestContents] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userCount, setUserCount] = useState(null);
  const [userTotal, setUserTotal] = useState(null);
  const [accessCount, setAccessCount] = useState(null);
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const [showFirstLoginPopup, setShowFirstLoginPopup] = useState(false);
  
  useEffect(() => {
    const fetchLatestContent = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(
          `${baseUrl}/reptitist/library-content`
        );
        const data = response.data;

        if (data && Array.isArray(data) && data.length > 0) {
          const latestContent = data[data.length - 1];
          setTop1LatestContents(latestContent);
          setLoading(false);
          console.log("Latest content:", latestContent);
        } else {
          setTop1LatestContents(null);
          setLoading(false);
          console.log("No content available");
        }
      } catch (err) {
        console.error("Error fetching latest content:", err);
        setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
        setTop1LatestContents(null);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestContent();
  }, []);

  useEffect(() => {
    const fetchUserTotal = async () => {
      try {
        const res = await axios.get(`${baseUrl}/reptitist/user/all-users`);
        setUserTotal(res.data.total);
      } catch (err) {
        setUserTotal("N/A");
      }
    };
    fetchUserTotal();
  }, []);
  useEffect(() => {
    const fetchUserCount = async () => {
      try {
        const res = await axios.get(`${baseUrl}/reptitist/user/signup-in-week`);
        setUserCount(res.data.total);
      } catch (err) {
        setUserCount("N/A");
      }
    };
    fetchUserCount();
  }, []);

  useEffect(() => {
    const fetchAccessCount = async () => {
      try {
        const res = await axios.get(`${baseUrl}/visits`);
        setAccessCount(res.data.count);
      } catch (err) {
        setAccessCount("N/A");
      }
    };
    fetchAccessCount();
  }, []);

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user._id) {
      // Tạo key duy nhất cho từng user
      const firstLoginKey = `firstLoginPopupShown_${user._id}`;
      if (!localStorage.getItem(firstLoginKey)) {
        setShowFirstLoginPopup(true);
        localStorage.setItem(firstLoginKey, "true");
      }
    }
  }, [user]);

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
              Hệ sinh thái AI chăm sóc bò sát 24/7: Chatbot thông minh, thư viện
              kiến thức, hồ sơ cá nhân hóa, kết nối cộng đồng, khám bệnh và mua
              sắm dễ dàng – chăm sóc bò sát chưa bao giờ tiện lợi hơn!
            </p>
            <div className="hero-buttons">
              <button
                className="btn btn-primary"
                onClick={() => navigate(user ? "/YourPet" : "/Login")}
              >
                KHÁM PHÁ NGAY!
              </button>
              <a href="/PlanUpgrade" className="btn btn-secondary">
                CÁC GÓI DỊCH VỤ
              </a>
            </div>
          </div>
          <div className="discount-badge">
            <span className="amount">100%</span>
            <span>FREE</span>
          </div>
        </div>
      </section>

      <section className="about">
        <div className="container">
          <h2 className="landing-main-title">
            NỀN TẢNG CHĂM SÓC BÒ SÁT TOÀN DIỆN
          </h2>
          <h3
            className="landing-main-title"
            style={{
              textAlign: "center",
              justifyContent: "center",
              fontWeight: "700px",
              fontSize: "2rem",
              backgroundColor: "#0fa958",
              color: "#000000",
            }}
          >
            REPTITIST
          </h3>

          <div className="about-flex">
            <div className="about-content hero-description">
              <p>
                Reptitist tự hào là nền tảng tiên phong và dẫn đầu trong lĩnh
                vực chăm sóc bò sát cảnh tại Việt Nam, nơi hội tụ của công nghệ
                hiện đại, kiến thức chuyên sâu và cộng đồng đam mê bò sát. Với
                tâm huyết xây dựng một hệ sinh thái toàn diện, chúng tôi không
                ngừng phát triển và hoàn thiện các giải pháp chuyên biệt nhằm
                đáp ứng mọi nhu cầu trong việc chăm sóc, bảo vệ và nâng cao chất
                lượng sống cho các loài bò sát cảnh – những người bạn đặc biệt,
                thân thiết và đầy cá tính của bạn.
              </p>
              <p>
                Sứ mệnh của Reptitist là mang đến một cuộc sống khỏe mạnh, an
                toàn và trọn vẹn hơn cho bò sát, đồng thời hỗ trợ người nuôi
                tiếp cận các công cụ, kiến thức và dịch vụ tốt nhất. Từ hệ thống
                chatbot AI hoạt động 24/7, thư viện tri thức phong phú, hồ sơ
                chăm sóc cá nhân hóa cho từng loài, đến dịch vụ tư vấn sức khỏe
                và kết nối cộng đồng, chúng tôi đang định hình lại cách người
                nuôi tương tác và chăm sóc bò sát trong kỷ nguyên số. Reptitist
                không chỉ là một nền tảng – mà là người bạn đồng hành lý tưởng
                của mọi người nuôi bò sát, từ người mới bắt đầu đến những nhà
                sưu tầm kỳ cựu.
              </p>

              <p>
                Chúng tôi tự hào mang đến những trải nghiệm tốt nhất, được khách
                hàng tin tưởng và đánh giá cao, trở thành lựa chọn ưu tiên cho
                cộng đồng yêu bò sát tại Việt Nam.
              </p>
            </div>
            <div className="about-image">
              {/* <img src="BGLandingPage.png" alt="Bò sát tại Reptiest" /> */}
              <ReactPlayer
                playing={true}
                muted={true}
                url="https://www.youtube.com/watch?v=KYPKoT8C5TA"
                controls
                width="100%"
              />
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
                "/feature_thuvien.png",
                "/feature_bosat.png",
                "/feature_tuvan.png",
                "/feature_shop.png",
              ];
              const links = [
                "/LibraryTopic",
                "/YourPet",
                "/Community",
                "/ShopLandingPage",
              ];
              return (
                <div
                  className="feature-card"
                  key={i}
                  style={{
                    cursor: "pointer",
                    transition: "transform 0.2s, box-shadow 0.2s",
                  }}
                  onClick={() => {
                    if (!user) {
                      navigate("/Login");
                    } else {
                      navigate(links[i]);
                    }
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform =
                      "translateY(-8px) scale(1.04)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = "none";
                  }}
                >
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

      <section className="news" style={{ paddingTop: "0px" }}>
        <div className="container">
          <h2 className="section-title">THÔNG TIN VÀ CẬP NHẬT</h2>
          <div className="news-grid">
            <div className="featured-news">
              <div className="featured-news-image">
                <img src={top1LatestContents?.image_urls[0]} alt="Tắc kè hoa" />
              </div>
              <div className="featured-news-content">
                <h3 className="news-title">{top1LatestContents?.title}</h3>
                <p className="news-excerpt">
                  {top1LatestContents?.content?.substring(0, 350)}
                  {top1LatestContents?.content?.length > 350 && "..."}
                </p>
                <a
                  href={`/librarycontent/${top1LatestContents?.category_content_id}`}
                  className="btn btn-primary"
                  style={{ backgroundColor: "#0fa958", borderRadius: "30px" }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = "#006934";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = "#0fa958";
                  }}
                >
                  Xem thêm
                </a>
              </div>
            </div>

            <div className="recent-news">
              {[
                {
                  title: "Số lượng truy cập hệ thống",
                  image: "/line-chart.png",
                },
                {
                  title: "Số lượng người dùng hệ thống",
                  image: "/group.png",
                },
                {
                  title: "Số lượng thông tin kiến thức",
                  image: "/online-meeting.png",
                },
                {
                  title: "Số lượng đăng kí trong tuần",
                  image: "/add-friend.png",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    background: "#fff",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
                    padding: "10px 20px",
                    display: "flex",
                    alignItems: "center",
                    transition:
                      "box-shadow 0.25s cubic-bezier(.4,0,.2,1), transform 0.18s cubic-bezier(.4,0,.2,1)",
                    cursor: "copy",
                    marginBottom: 8,
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform =
                      "translateY(-4px) scale(1.03)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = "none";
                  }}
                >
                  <div style={{ marginRight: 18 }}>
                    <img
                      src={item.image}
                      alt="Bò sát"
                      style={{
                        width: 48,
                        height: 48,
                        objectFit: "contain",
                        display: "block",
                      }}
                    />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: 17, fontWeight: 600 }}>
                      {item.title}
                    </h4>
                    <p
                      style={{
                        margin: 0,
                        color: "#666",
                        fontSize: "bold",
                        color: "#0fa958",
                      }}
                    >
                      {item.title === "Số lượng người dùng hệ thống"
                        ? userTotal !== null
                          ? userTotal + " Tài khoản"
                          : "Đang tải..."
                        : ""}
                    </p>
                    <p
                      style={{
                        margin: 0,
                        color: "#666",
                        fontSize: "bold",
                        color: "#0fa958",
                      }}
                    >
                      {item.title === "Số lượng thông tin kiến thức" ? "1.000 + bài":""
                       }
                    </p>
                    <p
                      style={{
                        margin: 0,
                        color: "#666",
                        fontSize: "bold",
                        color: "#0fa958",
                      }}
                    >
                      {item.title === "Số lượng đăng kí trong tuần"
                        ? userCount !== null
                          ? userCount + " Tài khoản"
                          : "Đang tải..."
                        : ""}
                    </p>
                    <p
                      style={{
                        margin: 0,
                        color: "#666",
                        fontSize: "bold",
                        color: "#0fa958",
                      }}
                    >
                      {item.title === "Số lượng truy cập hệ thống"
                        ? accessCount !== null
                          ? accessCount + " Lượt"
                          : "Đang tải..."
                        : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />


      {showFirstLoginPopup && (
        <div className="first-login-popup-overlay">
          <div className="first-login-popup">
            <h2>Đăng nhập lần đầu tiên?</h2>
            <p>Chào mừng bạn đến với Reptitist! Bạn có muốn xem hướng dẫn sử dụng?</p>
            <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
              <button
                className="help-dialog-btn main"
                onClick={() => {
                  setShowFirstLoginPopup(false);
                  navigate("/user-manual");
                }}
              >
                Xem hướng dẫn
              </button>
              <button
                className="help-dialog-btn"
                onClick={() => setShowFirstLoginPopup(false)}
              >
                Để sau
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LandingPage;