import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { baseUrl } from '../config';


const Library = () => {
  const [topics, setTopics] = useState([]);
  const [openIndex, setOpenIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user && user.role === "admin";

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${baseUrl}/reptitist/topic-categories/library_topics`)
      .then((response) => {
        setTopics(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Lỗi khi lấy danh sách chủ đề:", error);
        setLoading(false);
      });
  }, []);

  const toggleTopic = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleDelete = async (topicId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa chủ đề này?")) {
      try {
        await axios.delete(`${baseUrl}/reptitist/library_topics/${topicId}`);
        setTopics(topics.filter((topic) => topic._id !== topicId));
        alert("Xóa chủ đề thành công!");
      } catch (error) {
        console.error("Lỗi khi xóa chủ đề:", error);
        alert("Có lỗi xảy ra khi xóa chủ đề!");
      }
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <img src="/loading.gif" alt="Loading" style={{ width: 50, height: 50, marginRight: 12 }} />
        Đang tải danh sách chủ đề...
      </div>
    );
  }

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
                        ▶
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
              {isAdmin && (
                <div style={{ marginTop: "20px" }}>
                  <Link to="/library_topics/create">
                    <button
                      style={{
                        width: "100%",
                        padding: "8px 16px",
                        backgroundColor: "#28a745",
                        color: "#fff",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                        transition: "background-color 0.2s ease",
                        ":hover": {
                          backgroundColor: "#218838"
                        }
                      }}
                    >
                      + Tạo chủ đề
                    </button>
                  </Link>
                </div>
              )}
            </div>

            {/* Content Grid */}
            <div style={{ flex: 1 }}>
              <div
                className="content-grid"
                style={{ 
                  display: "grid", 
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "20px"
                }}
              >
                {topics.map((topic) => (
                  <div
                    className="category-card"
                    key={topic._id}
                    style={{
                      width: "100%",
                      height: "auto",
                      border: "1px solid #ccc",
                      borderRadius: "8px",
                      padding: "15px",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                      transition: "transform 0.2s ease",
                      ":hover": {
                        transform: "translateY(-5px)"
                      }
                    }}
                  >
                    <Link to={`/libraryCategory/${topic._id}`}>
                      <div className="card-image" style={{ cursor: "pointer" }}>
                        <img
                          src={topic.topic_imageurl?.[0] || "https://cdn.pixabay.com/photo/2017/01/31/15/06/dinosaurs-2022584_960_720.png"}
                          alt={topic.topic_title}
                          style={{
                            width: "100%",
                            height: "200px",
                            objectFit: "cover",
                            borderRadius: "4px",
                          }}
                        />
                      </div>
                    </Link>

                    <div className="card-title" style={{ 
                      marginTop: "15px", 
                      fontWeight: "bold",
                      fontSize: "1.1rem",
                      color: "#333"
                    }}>
                      {topic.topic_title}
                    </div>
                    <div
                      style={{
                        marginTop: "15px",
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "10px"
                      }}
                    >
                      {isAdmin && (
                        <>
                          <Link to={`/library_topics/update/${topic._id}`} style={{ flex: 1 }}>
                            <button
                              style={{
                                width: "100%",
                                backgroundColor: "#ffc107",
                                border: "none",
                                padding: "8px 12px",
                                borderRadius: "4px",
                                cursor: "pointer",
                                transition: "background-color 0.2s ease"
                              }}
                            >
                              Cập nhật
                            </button>
                          </Link>
                          <button
                            style={{
                              flex: 1,
                              backgroundColor: "#dc3545",
                              color: "#fff",
                              border: "none",
                              padding: "8px 12px",
                              borderRadius: "4px",
                              cursor: "pointer",
                              transition: "background-color 0.2s ease"
                            }}
                            onClick={() => handleDelete(topic._id)}
                          >
                            Xoá
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>


      <Footer />
    </>
  );
};

export default Library;