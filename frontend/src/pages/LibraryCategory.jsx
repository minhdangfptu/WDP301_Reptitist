import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import Footer from "../components/Footer";
const baseUrl = import.meta.env.VITE_BACKEND_URL;
const LibraryCategory = () => {
  const [allCategories, setAllCategories] = useState([]);
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();
  const [openIndex, setOpenIndex] = useState(null);
  const topicId = id;
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        console.log(topicId, 'topicId');
        const response = await axios.get(`http://localhost:8080/reptitist/library_categories/topic/${topicId}`);
        setAllCategories(response.data);
      } catch (err) {
        setError("Lỗi khi tải danh sách danh mục");
      }
    };

    const fetchTopic = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/reptitist/library_topics/${topicId}`);
        setTopic(response.data);
      } catch (err) {
        setError("Lỗi khi tải thông tin chủ đề");
      }
    };

    Promise.all([fetchCategories(), fetchTopic()]).then(() => {
      setLoading(false);
    });
  }, [topicId]);

  const handleDelete = async (categoryId) => {
    if (window.confirm("Bạn có chắc chắn muốn xoá danh mục này không?")) {
      try {
        await axios.delete(`http://localhost:8080/reptitist/library_categories/${categoryId}`);
        setAllCategories(allCategories.filter((cat) => cat._id !== categoryId));
      } catch (error) {
        alert("Lỗi khi xoá danh mục.");
      }
    }
  };

  const toggleTopic = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  if (loading) return <div className="text-center my-5">Đang tải dữ liệu...</div>;
  if (error) return <div className="text-danger text-center my-5">{error}</div>;

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
          <a href="/LibraryTopic">Thư viện kiến thức</a> <i className="fas fa-angle-right"></i>{" "}
          <span>{topic?.topic_title || "Chủ đề không xác định"}</span>
        </div>

        <div className="d-flex justify-content-end mb-3">
          <Link to={`/library_categories/create/${topicId}`}>
            <button className="btn btn-success">+ Tạo danh mục</button>
          </Link>
        </div>
      </div>

      <section className="library-section">
        <div className="container">
          <div className="library-content">
            {/* Sidebar */}
            <div className="sidebar">
              <h2 className="sidebar-title">Thư viện kiến thức</h2>
              <ul className="sidebar-menu list-unstyled">
                {allCategories.map((cat, idx) => (
                  <li key={cat._id}>
                    <div
                      className="menu-item"
                      onClick={() => toggleTopic(idx)}
                      style={{ cursor: "pointer", userSelect: "none" }}
                    >
                      <Link to="#" className="menu-link">
                        {cat.category_content}
                      </Link>
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
                        <Link to={`/librarycontent/${cat._id}`}>
                          {cat.category_description || "Chưa có mô tả"}
                        </Link>
                      </li>
                    </ul>
                  </li>
                ))}
              </ul>
            </div>

            {/* Content Grid */}
            <div className="content-grid">
              {allCategories.map((cat) => (
                <div className="category-card" key={cat._id}>
                  <Link to={`/librarycontent/${cat._id}`}>
                    <div className="card-image" style={{ cursor: "pointer" }}>
                      <img
                        src={cat.category_imageurl || "https://cdn.pixabay.com/photo/2017/01/31/15/06/dinosaurs-2022584_960_720.png"}
                        alt={cat.category_content}
                      />
                    </div>
                  </Link>

                  <div className="card-title">{cat.category_content}</div>
                  <div
                    style={{
                      marginTop: "10px",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <Link to={`/library_categories/update/${cat._id}`}>
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
                      onClick={() => handleDelete(cat._id)}
                    >
                      Xoá
                    </button>
                  </div>
                </div>
              ))}
              {allCategories.length === 0 && (
                <div className="col-12 text-center mt-4">
                  <p>Không có danh mục nào để hiển thị.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default LibraryCategory;