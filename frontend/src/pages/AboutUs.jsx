import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../css/AboutUs.css";
import ReactDOM from "react-dom";

const AboutUs = () => {
  // Enhanced team data with achievements
  const teamData = {
  khang: {
    avatar: "/about_us/minh.png",
    name: "Đặng Măng Định",
    role: "CEO & Co - Founder (CỰU THIẾU NHI)",
    summary: "Lãnh đạo chiến lược trong lĩnh vực công nghệ chăm sóc bò sát",
    bio: "Với hơn 15 năm kinh nghiệm trong khởi nghiệp công nghệ, Khang là người dẫn dắt REPTISIST phát triển nền tảng AI chăm sóc bò sát 24/7. Anh có tầm nhìn chiến lược và kinh nghiệm quản lý hệ sinh thái sản phẩm số, từng làm việc tại Google và Microsoft.",
    skills: [
      "Strategic Leadership",
      "Startup Growth",
      "AI Product Vision",
      "Investor Relations",
      "Market Expansion",
      "Team Management"
    ],
    achievements: [
      "Phát triển hệ sinh thái AI chăm sóc bò sát 24/7 đầu tiên tại Đông Nam Á",
      "Tăng trưởng người dùng từ 0 đến 2 triệu chỉ trong 18 tháng",
      "Huy động vốn Series A & B tổng 50 triệu USD",
      "Top 10 Startup AI châu Á theo TechInAsia",
      "Diễn giả tại hội thảo AI for Petcare toàn cầu"
    ],
    email: "khang@REPTISIST.com",
    phone: "+84 901 234 567",
    linkedin: "linkedin.com/in/khang-nguyen"
  },
  huong: {
    avatar: "/about_us/tung.png",
    name: "Trần Khánh NookTung",
    role: "Giám đốc công nghệ (CTO)",
    summary: "Kiến trúc sư công nghệ AI với nền tảng học thuật xuất sắc",
    bio: "Tiến sĩ từ MIT, Hương là người đứng sau hệ thống AI chăm sóc bò sát 24/7, bao gồm chatbot thông minh, khám bệnh qua ảnh, và gợi ý chăm sóc cá nhân hóa. Cô từng công tác tại Facebook AI Research và Google Health.",
    skills: [
      "Artificial Intelligence",
      "Machine Learning",
      "AI Chatbot Development",
      "Image Recognition",
      "Scalable Architecture",
      "HealthTech Engineering"
    ],
    achievements: [
      "Phát triển AI khám bệnh bò sát qua ảnh đạt độ chính xác 92%",
      "50+ bài báo khoa học về AI/ML",
      "Hệ thống chatbot xử lý 5 triệu lượt tương tác/tháng",
      "TEDx speaker về AI và vật nuôi",
      "Được Forbes Asia vinh danh 'Top Women in AI'"
    ],
    email: "huong@REPTISIST.com",
    phone: "+84 901 234 568",
    linkedin: "linkedin.com/in/huong-tran"
  },
  anh: {
    avatar: "/about_us/q_huy.png",
    name: "Đỗ Quang HờUy",
    role: "Giám đốc tài chính (CFO)",
    summary: "Thiết kế trải nghiệm người dùng cho hệ sinh thái bò sát thông minh",
    bio: "Với nền tảng UX/UI vững chắc, Anh đảm bảo mọi trải nghiệm người dùng trên ứng dụng – từ thư viện kiến thức đến hồ sơ chăm sóc cá nhân hóa – đều thân thiện và hiệu quả. Cô từng làm việc tại Google Design và Figma.",
    skills: [
      "UX/UI Design",
      "Petcare App Design",
      "User Research",
      "AI-Powered Interfaces",
      "Responsive Web Design",
      "Design Thinking"
    ],
    achievements: [
      "Thiết kế thư viện kiến thức bò sát trực quan, 1 triệu lượt truy cập",
      "Top 3 ứng dụng UX tại Vietnam Design Awards 2024",
      "Tăng retention rate người dùng lên 40% nhờ thiết kế onboarding mới",
      "Chủ trì workshop thiết kế hệ thống chăm sóc pet thông minh"
    ],
    email: "anh@REPTISIST.com",
    phone: "+84 901 234 569",
    linkedin: "linkedin.com/in/anh-le"
  },
  mai: {
    avatar: "/about_us/d_huy.png",
    name: "Phạm Đức Hoe",
    role: "Giám đốc vận hành (COO)",
    summary: "Chuyên gia vận hành hệ thống AI và quản lý quy trình chăm sóc bò sát",
    bio: "Mai có kinh nghiệm xây dựng quy trình vận hành cho hệ sinh thái công nghệ chăm sóc thú cưng. Từng làm tại Amazon và McKinsey, cô là người đảm bảo mọi dịch vụ – từ chatbot đến giao hàng sản phẩm – đều vận hành trơn tru.",
    skills: [
      "Operations Management",
      "Petcare Logistics",
      "AI Workflow Optimization",
      "Vendor Management",
      "Scrum & Agile",
      "SLA & KPIs"
    ],
    achievements: [
      "Xây dựng hệ thống giao hàng thức ăn/thiết bị bò sát toàn quốc",
      "Tối ưu chi phí vận hành giảm 35%",
      "Đưa quy trình chăm sóc AI đạt SLA 99%",
      "ISO 27001 Certified – Data handling & privacy"
    ],
    email: "mai@REPTISIST.com",
    phone: "+84 901 234 570",
    linkedin: "linkedin.com/in/mai-pham"
  },
  tung: {
    avatar: "/about_us/tien.png",
    name: "Đỗ Doãn Tiến ",
    role: "Giám đốc sản xuất (CPO)",
    summary: "Người tiên phong công nghệ khám bệnh và chăm sóc bò sát bằng AI",
    bio: "Tùng là tiến sĩ chuyên nghiên cứu về Blockchain và AI cho ngành thú cưng. Anh dẫn đầu các dự án như nhận diện bệnh bò sát qua ảnh, AI gợi ý môi trường sống lý tưởng và hệ thống hồ sơ số hóa vật nuôi.",
    skills: [
      "Computer Vision",
      "Pet Health AI",
      "Blockchain for Pet ID",
      "Predictive Care",
      "Tech Scouting",
      "Data-Driven Innovation"
    ],
    achievements: [
      "Phát triển hệ thống nhận diện bệnh da bò sát đạt độ chính xác 90%",
      "Ứng dụng AI giúp giảm 30% tỉ lệ bệnh thường gặp",
      "Đăng ký 5 bằng sáng chế liên quan đến bò sát & AI",
      "Collab với Trường ĐH Nông Lâm và VetHub"
    ],
    email: "tung@REPTISIST.com",
    phone: "+84 901 234 571",
    linkedin: "linkedin.com/in/tung-vu"
  },
  thu: {
    avatar: "/Gecko2.png",
    name: "Đặng Minh G",
    role: "Head of People & Culture",
    summary: "Phát triển đội ngũ yêu bò sát và giàu tinh thần công nghệ",
    bio: "Thư tập trung xây dựng văn hóa doanh nghiệp gắn kết và đào tạo đội ngũ chuyên gia công nghệ – bác sĩ thú y – content creator trong lĩnh vực bò sát. Từng làm việc tại Airbnb và Google HR, cô mang tới mô hình 'Pet First Workplace'.",
    skills: [
      "HR for PetTech",
      "Talent Development",
      "Remote Culture Building",
      "Pet-Friendly HR Policies",
      "People Analytics",
      "Diversity & Inclusion"
    ],
    achievements: [
      "Tỷ lệ gắn bó nhân viên đạt 95%",
      "Mô hình 'AI + Vet + Care' giúp gắn kết đa ngành",
      "Được HR Asia vinh danh 'Best Place to Work in PetTech'",
      "Tổ chức hội thảo chăm sóc bò sát toàn quốc với 3.000 người tham dự"
    ],
    email: "thu@REPTISIST.com",
    phone: "+84 901 234 572",
    linkedin: "linkedin.com/in/thu-dang"
  }
};


  // Team interaction states
  const [modalMember, setModalMember] = useState(null);
  const [hoveredMember, setHoveredMember] = useState(null);

  // Counter animation
  const [counters, setCounters] = useState({});

  // Smooth scroll functionality
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  // Counter animation
  const animateCounter = (target, setValue) => {
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      setValue(Math.floor(current));
    }, 16);
  };

  // Intersection Observer for animations
  useEffect(() => {
    const revealElements = document.querySelectorAll(".about-fade-in");

    const revealElementOnScroll = () => {
      revealElements.forEach((element) => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;

        if (elementTop < window.innerHeight - elementVisible) {
          element.classList.add("about-visible");
        }
      });
    };

    window.addEventListener("scroll", revealElementOnScroll);
    revealElementOnScroll();

    // Counter observer
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = parseInt(entry.target.getAttribute("data-target"));
            const key = entry.target.getAttribute("data-key");
            // Chỉ chạy counter nếu chưa từng chạy (counters[key] === undefined)
            if (typeof counters[key] === "undefined") {
              setCounters((prev) => ({ ...prev, [key]: 0 }));
              animateCounter(target, (value) => {
                setCounters((prev) => ({ ...prev, [key]: value }));
              });
            }
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    document.querySelectorAll(".about-stat-number").forEach((counter) => {
      counterObserver.observe(counter);
    });

    // Keyboard support
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && modalMember) {
        setModalMember(null);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("scroll", revealElementOnScroll);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [modalMember, counters]);

  useEffect(() => {
    if (modalMember) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [modalMember]);

  return (
    <div>
      <Header />
      <div className="about-bg-container">
        <div className="about-geometric-shapes">
          <div className="about-shape"></div>
          <div className="about-shape"></div>
          <div className="about-shape"></div>
          <div className="about-shape"></div>
        </div>
      </div>

      <section className="about-hero" id="home">
        <div className="about-hero-left">
          <h1 className="about-hero-title1">Chúng Tôi Đơn Giản Là</h1>
          <h1 className="about-hero-title">REPTISIST</h1>
          <p className="about-hero-subtitle">
            Hệ sinh thái AI cho bò sát: Chatbot thông minh, thư viện kiến thức,
            hồ sơ cá nhân hóa, kết nối cộng đồng, khám bệnh và mua sắm dễ dàng –
            chăm sóc bò sát chưa bao giờ tiện lợi hơn!
          </p>

          <div className="about-hero-stats">
            <div className="about-hero-stat">
              <span className="about-hero-stat-number">894 </span>
              <span className="about-hero-stat-label">
                Lượt truy cập mỗi tuần
              </span>
            </div>
            <div className="about-hero-stat">
              <span className="about-hero-stat-number">276</span>
              <span className="about-hero-stat-label">Bài viết chuyên sâu</span>
            </div>
            <div className="about-hero-stat">
              <span className="about-hero-stat-number">764</span>
              <span className="about-hero-stat-label">Giống loài</span>
            </div>
          </div>

          <a
            href="#story"
            className="about-hero-cta"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection("story");
            }}
          >
            Khám phá ngay
            <span>→</span>
          </a>
        </div>

        <div className="about-hero-right">
          <div className="about-hero-visual">
            <img src="/logo1.png" alt="Reptisist Logo" className="about-hero-logo" />
          </div>
        </div>
      </section>

      <section className="about-section" id="story">
        <div className="about-story-section about-fade-in">
          <h2 className="about-section-title">Câu Chuyện Của Chúng Tôi</h2>

          <div className="about-story-grid">
            <div className="about-story-content">
              <h3>Khởi Đầu Từ Ý Tưởng</h3>
              <p>
                REPTISIST ra đời năm 2025, khi ba nhà sáng lập nhận ra khoảng
                trống lớn trong việc chăm sóc thú cưng bò sát tại Việt Nam. Bằng
                sự kết hợp giữa <em>passion</em> và <em>innovation</em>,{" "}
                <em>technology</em>, chúng tôi bắt đầu xây dựng ứng dụng nhỏ ghi
                lại nhiệt độ terrarium, ánh sáng và chế độ ăn.
              </p>
              <p>
                Sau hơn 10 năm, ứng dụng ấy đã phát triển thành nền tảng AI toàn
                diện, kết nối người nuôi, bác sĩ thú y, nhà cung cấp phụ kiện và
                các chuyên gia bò sát hàng đầu.
              </p>
            </div>
            <div className="about-story-visual">🚀
              <img src="/about_1.png" alt="Reptisist Logo" />
            </div>
          </div>

          <div className="about-story-grid">
            <div className="about-story-visual">
              <img src="/about_2.png" alt="Reptisist Vision" />
            </div>
            <div className="about-story-content">
              <h3>Tầm Nhìn & Sứ Mệnh</h3>
              <p>
                <strong>Tầm nhìn</strong> – Trở thành hệ sinh thái bò sát số 1
                Đông Nam Á, nơi mọi loài được chăm sóc khoa học &amp; nhân văn.
              </p>
              <p>
                <strong>Sứ mệnh</strong> – Ứng dụng trí tuệ nhân tạo để mang lại
                giải pháp chăm sóc cá nhân hoá, thúc đẩy kiến thức cộng đồng và
                tạo thị trường giao thương minh bạch cho người nuôi bò sát.
              </p>
            </div>
          </div>

          <div className="about-story-grid">
            <div className="about-story-content">
              <h3>Triết Lý Phát Triển</h3>
              <p>
                Chúng tôi tin rằng <em>Well‑being của động vật</em> phải song
                hành với <em>tiện ích cho con người</em>. Công nghệ chỉ thực sự
                có ý nghĩa khi giúp giảm stress cho thú cưng, tiết kiệm thời
                gian cho người nuôi và gìn giữ đa dạng sinh học.
              </p>
              <p>
                Mỗi sản phẩm, từ AI Health Check tới Vet Hotline, đều được thiết
                kế với nguyên tắc
                <strong>"Technology for Reptile Welfare"</strong> – công nghệ
                phục vụ sự khoẻ mạnh và hạnh phúc của bò sát.
              </p>
            </div>
            <div className="about-story-visual">
              <img src="/about_3.png" alt="Reptisist Logo" />
            </div>
          </div>
        </div>
      </section>

      <section className="about-values-section about-fade-in" id="values">
        <div className="about-container">
          <h2 className="about-section-title">Giá Trị Cốt Lõi</h2>
          <div className="about-values-container">
            <div className="about-value-card">
              <span className="about-value-icon">🤖</span>
              <h3>Chatbot Thông Minh</h3>
              <p>
                Trợ lý ảo 24/7 hỗ trợ chẩn đoán nhanh, giải đáp mọi thắc mắc về
                bò sát.
              </p>
            </div>
            <div className="about-value-card">
              <span className="about-value-icon">📚</span>
              <h3>Thư Viện Kiến Thức</h3>
              <p>
                Kho nội dung chuyên sâu về cách nuôi, chăm sóc và phòng bệnh cho
                bò sát.
              </p>
            </div>
            <div className="about-value-card">
              <span className="about-value-icon">🧬</span>
              <h3>Hồ Sơ Cá Nhân Hóa</h3>
              <p>
                Lưu trữ thông tin từng cá thể bò sát để theo dõi lịch sử sức
                khỏe & dinh dưỡng.
              </p>
            </div>
            <div className="about-value-card">
              <span className="about-value-icon">👥</span>
              <h3>Kết Nối Cộng Đồng</h3>
              <p>
                Diễn đàn & sự kiện offline giúp người nuôi chia sẻ kinh nghiệm,
                học hỏi lẫn nhau.
              </p>
            </div>
            <div className="about-value-card">
              <span className="about-value-icon">🩺</span>
              <h3>Khám Bệnh Dễ Dàng</h3>
              <p>
                Kết nối nhanh đến bác sĩ thú y qua video call, AI Health Check
                hoặc đặt lịch trực tiếp.
              </p>
            </div>
            <div className="about-value-card">
              <span className="about-value-icon">🛒</span>
              <h3>Mua Sắm Tiện Lợi</h3>
              <p>
                Sàn TMĐT chuyên biệt với hàng nghìn sản phẩm cho bò sát – đảm
                bảo nguồn gốc & chất lượng.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="about-team-section about-fade-in" id="team">
        <div className="about-team-container">
          <div className="about-team-header">
            <h2>Đội Ngũ Lãnh Đạo</h2>
            <p>
              Gặp gỡ những con người đằng sau REPTISIST – từ bác sĩ thú y,
              chuyên gia AI đến nhà thiết kế trải nghiệm. Chính họ đang tái định
              nghĩa cách chăm sóc bò sát trong kỷ nguyên số.
            </p>
          </div>
          <div className="about-team-gallery">
            <div className="about-team-cards-row no-wrap">
              {Object.entries(teamData)
                .filter(([key]) => key !== "thu")
                .map(([key, member]) => (
                  <div
                    key={key}
                    className={`about-team-member-card${
                      hoveredMember === key ? " about-focused" : " about-blur"
                    }`}
                    onMouseEnter={() => setHoveredMember(key)}
                    onMouseLeave={() => setHoveredMember(null)}
                    onClick={() => setModalMember(member)}
                  >
                    <div className="about-member-image">
                      {member.avatar && member.avatar.endsWith(".png") ? (
                        <img
                          src={member.avatar}
                          alt={member.name}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            borderRadius: "0",
                          }}
                        />
                      ) : (
                        member.avatar
                      )}
                    </div>
                    <div className="about-member-overlay">
                      <div className="about-member-name">{member.name}</div>
                      <div className="about-member-role">{member.role}</div>
                    </div>
                  </div>
                ))}
            </div>


            {/* Modal */}
            {modalMember &&
              ReactDOM.createPortal(
                <div
                  className="about-team-modal-overlay"
                  onClick={() => setModalMember(null)}
                >
                  <div
                    className="about-team-modal"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="about-close-detail"
                      onClick={() => setModalMember(null)}
                    >
                      X
                    </button>
                    <div className="about-team-modal-content">
                      <div className="about-team-modal-avatar">
                        <div className="about-detail-avatar">
                          {modalMember.avatar &&
                          modalMember.avatar.endsWith(".png") ? (
                            <img
                              src={modalMember.avatar}
                              alt={modalMember.name}
                              style={{
                                width: "120px",
                                height: "120px",
                                objectFit: "cover",
                                borderRadius: "50%",
                              }}
                            />
                          ) : (
                            modalMember.avatar
                          )}
                        </div>
                      </div>
                      <div className="about-team-modal-info">
                        <div className="about-detail-name" style={{ fontSize: "2rem", fontWeight: "bold" }}>
                          {modalMember.name}
                        </div>
                        <div className="about-detail-role">
                          {modalMember.role}
                        </div>
                        <div className="about-detail-summary">
                          {modalMember.summary}
                        </div>
                        <div className="about-detail-section">
                          <h4>📖 Câu Chuyện</h4>
                          <p>{modalMember.bio}</p>
                        </div>
                        <div className="about-detail-section">
                          <h4>🚀 Chuyên Môn</h4>
                          <div className="about-skills-grid">
                            {modalMember.skills.map((skill, index) => (
                              <span key={index} className="about-skill-tag">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="about-detail-section">
                          <h4>🏆 Thành Tựu</h4>
                          <ul className="about-achievements-list">
                            {modalMember.achievements.map(
                              (achievement, index) => (
                                <li key={index}>{achievement}</li>
                              )
                            )}
                          </ul>
                        </div>
                        <div className="about-detail-section">
                          <h4>📞 Liên Hệ</h4>
                          <div className="about-contact-grid">
                            <div className="about-contact-item">
                              <div className="about-contact-icon">📧</div>
                              <span>{modalMember.email}</span>
                            </div>
                            <div className="about-contact-item">
                              <div className="about-contact-icon">📱</div>
                              <span>{modalMember.phone}</span>
                            </div>
                            <div className="about-contact-item">
                              <div className="about-contact-icon">💼</div>
                              <span>{modalMember.linkedin}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>,
                document.body
              )}
          </div>
        </div>
      </section>

      <div className="about-stats-section about-fade-in">
        <div className="about-container">
          <h2 className="about-section-title">Thành Tựu Đáng Tự Hào</h2>
          <div className="about-stats-grid">
            <div className="about-stat-item">
              <span
                className="about-stat-number"
                data-target="100000"
                data-key="members"
              >
                577
              </span>
              <div className="about-stat-label">Thành Viên Cộng Đồng</div>
              <div className="about-stat-description">
                Người yêu bò sát toàn cầu
              </div>
            </div>
            <div className="about-stat-item">
              <span
                className="about-stat-number"
                data-target="10000"
                data-key="consults"
              >
                158
              </span>
              <div className="about-stat-label">Ca Tư Vấn Thành Công</div>
              <div className="about-stat-description">
                Vet Hotline & AI Chat
              </div>
            </div>
            <div className="about-stat-item">
              <span
                className="about-stat-number"
                data-target="150"
                data-key="species"
              >
                764
              </span>
              <div className="about-stat-label">Loài Bò Sát Hỗ Trợ</div>
              <div className="about-stat-description">Từ gecko đến rùa cạn</div>
            </div>
            <div className="about-stat-item">
              <span
                className="about-stat-number"
                data-target="365"
                data-key="uptime"
              >
                {counters.uptime || 0}
              </span>
              <div className="about-stat-label">Ngày Hỗ Trợ/Năm</div>
              <div className="about-stat-description">24/7 không gián đoạn</div>
            </div>
            <div className="about-stat-item">
              <span
                className="about-stat-number"
                data-target="5000"
                data-key="items"
              >
                33
              </span>
              <div className="about-stat-label">Sản Phẩm Trên Sàn TMĐT</div>
              <div className="about-stat-description">Phụ kiện & thức ăn</div>
            </div>
            <div className="about-stat-item">
              <span
                className="about-stat-number"
                data-target="98"
                data-key="satisfaction"
              >
                {counters.satisfaction || 0}
              </span>
              <div className="about-stat-label">% Hài Lòng Người Dùng</div>
              <div className="about-stat-description">Khảo sát 2025</div>
            </div>
          </div>
        </div>
      </div>

      <section className="about-cta-section about-fade-in" id="contact">
        <div className="about-cta-left">
          <div className="about-cta-content">
            <h2>Sẵn Sàng Chăm Bò Sát Thông Minh?</h2>
            <p>
              Hãy để REPTISIST đồng hành cùng bạn – từ chẩn đoán sức khỏe AI đến
              shopping phụ kiện. Tất cả trong một ứng dụng duy nhất.
            </p>
            <div className="about-cta-buttons">
              <a href="#contact" className="about-cta-button">
                Bắt đầu ngay
              </a>
              <a href="#portfolio" className="about-cta-button about-secondary">
                Khám phá tính năng
              </a>
            </div>
          </div>
        </div>
        <div className="about-cta-right">
          <img src="/team.png" alt="Reptisist Team" className="about-cta-img" />
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutUs;
