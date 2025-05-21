import React, { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const menuData = [
  {
    title: "Hướng dẫn chăm sóc",
    submenu: [
      "Khái quát về bò sát",
      "Kỹ thuật nuôi dưỡng",
      "Môi trường sống",
      "Thức ăn và dinh dưỡng",
    ],
  },
  {
    title: "Bài viết y học",
    submenu: ["Sơ cứu cơ bản", "Thuốc và liều lượng", "Các nghiên cứu mới"],
  },
  {
    title: "Bò sát phổ biến",
    submenu: ["Rồng Úc", "Rắn", "Thằn lằn", "Tắc kè", "Rùa"],
  },
  {
    title: "Bệnh lý thường gặp tại VN",
    submenu: ["Bệnh về da", "Bệnh về hô hấp", "Bệnh về tiêu hóa", "Ký sinh trùng"],
  },
  {
    title: "Cách điều trị",
    submenu: ["Phương pháp tự nhiên", "Dùng thuốc", "Thủ thuật phẫu thuật"],
  },
  {
    title: "Trang bị & Phụ kiện",
    submenu: ["Bể nuôi và lồng", "Hệ thống sưởi và ánh sáng", "Đồ trang trí", "Dụng cụ cho ăn"],
  },
];

const Library = () => {
  const [openIndexes, setOpenIndexes] = useState({});

  const toggleSubmenu = (index) => {
    setOpenIndexes((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <>
      <Header />

      <div className="page-title">
        <div className="container">
          <h1>THƯ VIỆN KIẾN THỨC</h1>
        </div>
      </div>

      <div className="container">
        <div className="breadcrumb">
          <a href="/LandingPage">Trang chủ</a> <i className="fas fa-angle-right"></i>{" "}
          <a href="/Library">Thư viện kiến thức</a>
        </div>
      </div>

      <section className="library-section">
        <div className="container">
          <div className="library-content">
            {/* Sidebar */}
            <div className="sidebar">
              <h2 className="sidebar-title">Thư viện kiến thức</h2>
              <ul className="sidebar-menu">
                {menuData.map((item, idx) => (
                  <li key={idx}>
                    <div className="menu-item" onClick={() => toggleSubmenu(idx)} style={{ cursor: "pointer", userSelect: "none" }}>
                      <a href="#" className="menu-link">{item.title}</a>
                      <span
                        className={`caret ${openIndexes[idx] ? "caret-up" : "caret-down"}`}
                        aria-hidden="true"
                      ></span>
                    </div>
                    <ul
                      className="submenu"
                      style={{ display: openIndexes[idx] ? "block" : "none" }}
                    >
                      {item.submenu.map((sub, i) => (
                        <li key={i}>
                          <a href={sub === "Khái quát về bò sát" ? "/LibraryDetail" : "#"}>
                            {sub}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>

            {/* Content Grid */}
            <div className="content-grid">
              {menuData.map((item, idx) => (
                <div className="category-card" key={idx}>
                  <div className="card-image">
                    <img
                      src="/api/placeholder/400/180"
                      alt={item.title}
                    />
                  </div>
                  <div className="card-title">{item.title}</div>
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

export default Library;
