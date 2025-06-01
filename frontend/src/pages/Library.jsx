// import React, { useState } from "react";
// import Header from "../components/Header";
// import Footer from "../components/Footer";

// const menuData = [
//   {
//     title: "Hướng dẫn chăm sóc",
//     submenu: [
//       "Khái quát về bò sát",
//       "Kỹ thuật nuôi dưỡng",
//       "Môi trường sống",
//       "Thức ăn và dinh dưỡng",
//     ],
//   },
//   {
//     title: "Bài viết y học",
//     submenu: ["Sơ cứu cơ bản", "Thuốc và liều lượng", "Các nghiên cứu mới"],
//   },
//   {
//     title: "Bò sát phổ biến",
//     submenu: ["Rồng Úc", "Rắn", "Thằn lằn", "Tắc kè", "Rùa"],
//   },
//   {
//     title: "Bệnh lý thường gặp tại VN",
//     submenu: ["Bệnh về da", "Bệnh về hô hấp", "Bệnh về tiêu hóa", "Ký sinh trùng"],
//   },
//   {
//     title: "Cách điều trị",
//     submenu: ["Phương pháp tự nhiên", "Dùng thuốc", "Thủ thuật phẫu thuật"],
//   },
//   {
//     title: "Trang bị & Phụ kiện",
//     submenu: ["Bể nuôi và lồng", "Hệ thống sưởi và ánh sáng", "Đồ trang trí", "Dụng cụ cho ăn"],
//   },
// ];

// const Library = () => {
//   const [openIndexes, setOpenIndexes] = useState({});

//   const toggleSubmenu = (index) => {
//     setOpenIndexes((prev) => ({
//       ...prev,
//       [index]: !prev[index],
//     }));
//   };

//   return (
//     <>
//       <Header />

//       <div className="page-title">
//         <div className="container">
//           <h1>THƯ VIỆN KIẾN THỨC</h1>
//         </div>
//       </div>

//       <div className="container">
//         <div className="breadcrumb">
//           <a href="/LandingPage">Trang chủ</a> <i className="fas fa-angle-right"></i>{" "}
//           <a href="/Library">Thư viện kiến thức</a>
//         </div>
//       </div>

//       <section className="library-section">
//         <div className="container">
//           <div className="library-content">
//             {/* Sidebar */}
//             <div className="sidebar">
//               <h2 className="sidebar-title">Thư viện kiến thức</h2>
//               <ul className="sidebar-menu">
//                 {menuData.map((item, idx) => (
//                   <li key={idx}>
//                     <div className="menu-item" onClick={() => toggleSubmenu(idx)} style={{ cursor: "pointer", userSelect: "none" }}>
//                       <a href="#" className="menu-link">{item.title}</a>
//                       <span
//                         className={`caret ${openIndexes[idx] ? "caret-up" : "caret-down"}`}
//                         aria-hidden="true"
//                       ></span>
//                     </div>
//                     <ul
//                       className="submenu"
//                       style={{ display: openIndexes[idx] ? "block" : "none" }}
//                     >
//                       {item.submenu.map((sub, i) => (
//                         <li key={i}>
//                           <a href={sub === "Khái quát về bò sát" ? "/LibraryDetail" : "#"}>
//                             {sub}
//                           </a>
//                         </li>
//                       ))}
//                     </ul>
//                   </li>
//                 ))}
//               </ul>
//             </div>

//             {/* Content Grid */}
//             <div className="content-grid">
//               {menuData.map((item, idx) => (
//                 <div className="category-card" key={idx}>
//                   <div className="card-image">
//                     <img
//                       src="/api/placeholder/400/180"
//                       alt={item.title}
//                     />
//                   </div>
//                   <div className="card-title">{item.title}</div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </section>

//       <Footer />
//     </>
//   );
// };

// export default Library;



// //complete page

import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import axios from "axios";
import { Link } from "react-router-dom";

const Library = () => {
  const [categories, setCategories] = useState([]);
  const [openIndex, setOpenIndex] = useState(null); // Để mở/đóng từng danh mục

  useEffect(() => {
    axios
      .get("http://localhost:8080/reptitist/library_categories")
      .then((response) => {
        setCategories(response.data);
      })
      .catch((error) => {
        console.error("Lỗi khi lấy danh mục:", error);
      });
  }, []);

  const toggleCategory = (index) => {
    setOpenIndex(openIndex === index ? null : index);
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
          <Link to="/">Trang chủ</Link> <i className="fas fa-angle-right"></i>{" "}
          <span>Thư viện kiến thức</span>
        </div>
      </div>

      <section className="library-section">
        <div className="container">
          <div className="library-content d-flex">
            {/* Sidebar */}
            <div className="sidebar me-5" style={{ width: "250px" }}>
              <h2 className="sidebar-title">Danh mục thư viện</h2>
              <ul className="sidebar-menu list-unstyled">
                {categories.map((cat, idx) => (
                  <li key={cat._id} style={{ marginBottom: "10px" }}>
                    <div
                      onClick={() => toggleCategory(idx)}
                      style={{
                        cursor: "pointer",
                        fontWeight: "bold",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span>{cat.category_content}</span>
                      <span
                        style={{
                          transform: openIndex === idx ? "rotate(90deg)" : "rotate(0deg)",
                          transition: "transform 0.2s ease",
                          display: "inline-block",
                        }}
                      >
                        ▶
                      </span>
                    </div>

                    {openIndex === idx && (
                      <ul style={{ paddingLeft: "15px", marginTop: "5px" }}>
                        <li>
                          <Link to={`/LibraryDetail/${cat._id}`}>
                            {cat.category_description || "Chưa có mô tả"}
                          </Link>
                        </li>
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Content Grid */}
            <div className="content-grid d-flex flex-wrap gap-4">
              {categories.map((cat, idx) => (
                <div
                  className="category-card border rounded p-3 text-center"
                  key={cat._id}
                  style={{ width: "250px" }}
                >
                  <div className="card-image mb-2">
                    <img
                      src={cat.category_imageurl || "/default.jpg"}
                      alt={cat.category_content}
                      style={{ width: "100%", height: "150px", objectFit: "cover" }}
                    />
                  </div>
                  <div className="card-title fw-bold">{cat.category_content}</div>
                  {/* <p>{cat.category_description}</p>
                  <Link to={`/library/${cat._id}`}>Xem chi tiết</Link> */}
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

