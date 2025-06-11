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

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xoá chủ đề này không?")) {
      try {
        await axios.delete(`http://localhost:8080/reptitist/library_topics/${id}`);
        setTopics(topics.filter((topic) => topic._id !== id));
      } catch (error) {
        console.error("Lỗi khi xoá chủ đề:", error);
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
          <a href="/">Trang chủ</a> <i className="fas fa-angle-right"></i>{" "}
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
                {topics.map((topic, idx) => (
                  <li key={topic._id}>
                    <div
                      className="menu-item"
                      onClick={() => toggleTopic(idx)}
                      style={{ cursor: "pointer", userSelect: "none" }}
                    >
                      <a href="#" className="menu-link">
                        {topic.topic_title}
                      </a>
                      <span
                        className={`caret ${openIndex === idx ? "caret-up" : "caret-down"}`}
                        aria-hidden="true"
                      ></span>
                    </div>
                    <ul
                      className="submenu"
                      style={{ display: openIndex === idx ? "block" : "none" }}
                    >
                      <li>
                        <a href={`/libraryCategory/${topic._id}`}>
                          {topic.topic_description || "Chưa có mô tả"}
                        </a>
                      </li>
                    </ul>
                  </li>
                ))}
              </ul>
            </div>

            {/* Main Content */}
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
