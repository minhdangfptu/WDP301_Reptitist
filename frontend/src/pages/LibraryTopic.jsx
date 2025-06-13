import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const Library = () => {
  const [topics, setTopics] = useState([]);
  const [openIndex, setOpenIndex] = useState(null);
  const navigate = useNavigate();

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


  const handleDelete = async (topicId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa chủ đề này?")) {
      try {
        await axios.delete(`http://localhost:8080/reptitist/library_topics/${topicId}`);
        setTopics(topics.filter((topic) => topic._id !== topicId));
        alert("Xóa chủ đề thành công!");
      } catch (error) {
        console.error("Lỗi khi xóa chủ đề:", error);
        alert("Có lỗi xảy ra khi xóa chủ đề!");
      }
    }
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
            </div>

            {/* Content Grid */}
            <div style={{ flex: 1 }}>
              <div style={{ textAlign: "right", marginBottom: "20px" }}>
                <Link to="/library_topics/create">
                  <button
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "#28a745",
                      color: "#fff",
                      border: "none",
                      borderRadius: "5px",
                    }}
                  >
                    + Tạo chủ đề
                  </button>
                </Link>
              </div>

              <div
                className="content-grid"
                style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}
              >
                {topics.map((topic) => (
                  <div
                    className="category-card"
                    key={topic._id}
                    style={{
                      width: "280px",
                      height: "auto",
                      border: "1px solid #ccc",
                      borderRadius: "8px",
                      padding: "10px",
                    }}
                  >
                    <div className="card-image">
                      <img
                        src={
                          topic.topic_imageurl?.[0] ||
                          "https://cdn.pixabay.com/photo/2017/01/31/15/06/dinosaurs-2022584_960_720.png"
                        }
                        alt={topic.topic_title}
                        style={{
                          width: "100%",
                          height: "200px",
                          objectFit: "cover",
                          borderRadius: "4px",
                        }}
                      />
                    </div>
                    <div className="card-title" style={{ marginTop: "10px", fontWeight: "bold" }}>
                      {topic.topic_title}
                    </div>
                    <div
                      style={{
                        marginTop: "10px",
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Link to={`/library_topics/update/${topic._id}`}>
                        <button
                          style={{
                            backgroundColor: "#ffc107",
                            border: "none",
                            padding: "4px 8px",
                            borderRadius: "4px",
                          }}
                        >
                          Cập nhật
                        </button>
                      </Link>
                      <button
                        style={{
                          backgroundColor: "#dc3545",
                          color: "#fff",
                          border: "none",
                          padding: "4px 8px",
                          borderRadius: "4px",
                        }}
                        onClick={() => handleDelete(topic._id)}
                      >
                        Xoá
                      </button>
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