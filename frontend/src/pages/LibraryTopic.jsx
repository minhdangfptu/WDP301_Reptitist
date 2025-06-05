import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import axios from "axios";
import { Link } from "react-router-dom";

const Library = () => {
  const [topics, setTopics] = useState([]);
  const [openIndex, setOpenIndex] = useState(null);

  useEffect(() => {
    axios
      .get("http://localhost:8080/reptitist/library_topics")
      .then((response) => {
        setTopics(response.data);
      })
      .catch((error) => {
        console.error("Lỗi khi lấy danh sách chủ đề:", error);
      });
  }, []);

  const toggleTopic = (index) => {
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
              <h2 className="sidebar-title">Chủ đề thư viện</h2>
              <ul className="sidebar-menu list-unstyled">
                {topics.map((topic, idx) => (
                  <li key={topic._id} style={{ marginBottom: "10px" }}>
                    <div
                      onClick={() => toggleTopic(idx)}
                      style={{
                        cursor: "pointer",
                        fontWeight: "bold",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span>{topic.topic_title}</span>
                      <span
                        style={{
                          transform: openIndex === idx ? "rotate(90deg)" : "rotate(0deg)",
                          transition: "transform 0.2s ease",
                          display: "inline-block",
                        }}
                      >
                        
                      </span>
                    </div>

                    {openIndex === idx && (
                      <ul style={{ paddingLeft: "15px", marginTop: "5px" }}>
                        <li>
                          <Link to={`/libraryCategory/${topic._id}`}>
                            {topic.topic_description || "Chưa có mô tả"}
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
              {topics.map((topic) => (
                <div
                  className="category-card border rounded p-3 text-center"
                  key={topic._id}
                  style={{ width: "250px" }}
                >
                  <div className="card-image mb-2">
                    <img
                      src={topic.topic_imageurl[0] || "/default.jpg"}
                      alt={topic.topic_title}
                      style={{ width: "100%", height: "150px", objectFit: "cover" }}
                    />
                  </div>
                  <div className="card-title fw-bold">{topic.topic_title}</div>
                  {/* <p>{topic.topic_description}</p>
                  <Link to={`/library/${topic._id}`}>Xem chi tiết</Link> */}
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
