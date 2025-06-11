import React, { useEffect, useState } from "react";
<<<<<<< Updated upstream
import { useParams, Link } from "react-router-dom";
=======
import { useNavigate, useParams, Link } from "react-router-dom";
>>>>>>> Stashed changes
import axios from "axios";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";

const LibraryCategory = () => {
<<<<<<< Updated upstream
  const { id } = useParams();
  const [category, setCategory] = useState(null);
=======
  const [allCategories, setAllCategories] = useState([]);
<<<<<<< Updated upstream
  const [topics, setTopics] = useState([]);
  const [openIndex, setOpenIndex] = useState(null);
>>>>>>> Stashed changes
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
<<<<<<< Updated upstream
    axios
      .get(`http://localhost:8080/reptitist/library_categories/${id}`)
      .then((response) => {
        setCategory(response.data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Lỗi khi tải dữ liệu danh mục");
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div>Đang tải dữ liệu...</div>;
  if (error) return <div>{error}</div>;
=======
    const fetchData = async () => {
      try {
        const [catRes, topicRes] = await Promise.all([
          axios.get("http://localhost:8080/reptitist/library_categories"),
          axios.get("http://localhost:8080/reptitist/library_topics"),
        ]);
        setAllCategories(catRes.data);
        setTopics(topicRes.data);
        setLoading(false);
      } catch (err) {
        setError("Lỗi khi tải dữ liệu thư viện.");
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleTopic = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="container my-5 d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" role="status" />
            <p>Đang tải dữ liệu...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="container my-5 d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
          <div className="text-center text-danger">
            <i className="bi bi-exclamation-triangle-fill" style={{ fontSize: "3rem" }}></i>
            <h4>{error}</h4>
            <button className="btn btn-outline-primary mt-3" onClick={() => window.location.reload()}>
              Thử lại
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }
>>>>>>> Stashed changes
=======
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();
  const topicId = id;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
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

  if (loading) return <div className="text-center my-5">Đang tải dữ liệu...</div>;
  if (error) return <div className="text-danger text-center my-5">{error}</div>;
>>>>>>> Stashed changes

  return (
    <>
      <Header />
<<<<<<< Updated upstream
<<<<<<< Updated upstream
      <div className="page-title">
        <div className="container">
          <h1>Chi tiết danh mục</h1>
=======

      <div className="page-title">
        <div className="container">
          <h1>THƯ VIỆN KIẾN THỨC</h1>
>>>>>>> Stashed changes
        </div>
      </div>

      <div className="container">
        <div className="breadcrumb">
<<<<<<< Updated upstream
          <Link to="/">Trang chủ</Link> <i className="fas fa-angle-right"></i>{" "}
          <Link to="/library">Thư viện kiến thức</Link> <i className="fas fa-angle-right"></i>{" "}
          <span>{category.category_content}</span>
        </div>

        <section className="category-detail my-4">
          <h2>{category.category_content}</h2>
          <img
            src={category.category_imageurl || "/default.jpg"}
            alt={category.category_content}
            style={{ maxWidth: "100%", height: "auto" }}
          />
          <p className="mt-3">{category.category_description || "Chưa có mô tả chi tiết"}</p>
        </section>
      </div>
=======

      <div className="page-title bg-light py-4">
        <div className="container text-center">
          <h1 className="fw-bold">DANH MỤC THƯ VIỆN</h1>
          <p className="text-muted">Khám phá các chủ đề kiến thức đa dạng và thú vị</p>
        </div>
      </div>

      <section className="library-section py-4">
        <div className="container">
          <div className="library-content d-flex">
            {/* Sidebar */}
            

            {/* Content Grid */}
            <div className="content-grid d-flex flex-wrap gap-4">
              {allCategories.length === 0 ? (
                <div className="text-center text-muted w-100">
                  <i className="bi bi-folder2-open mb-3" style={{ fontSize: "3rem" }}></i>
                  <h5>Chưa có danh mục nào</h5>
                  <p>Hãy thêm danh mục đầu tiên!</p>
                </div>
              ) : (
                allCategories.map((cat) => (
                  <div
                    key={cat._id}
                    className="category-card border rounded p-3 text-center shadow-sm"
                    style={{ width: "250px" }}
                  >
                    <div className="card-image mb-2">
                      <img
                        src={cat.category_imageurl || "/default.jpg"}
                        alt={cat.category_content}
                        onError={(e) => {
                          e.target.src = `https://via.placeholder.com/250x150/0d6efd/ffffff?text=${encodeURIComponent(cat.category_content)}`;
                        }}
                        style={{ width: "100%", height: "150px", objectFit: "cover", borderRadius: "5px" }}
                      />
                    </div>
                    <h3 className="fw-bold text-primary">{cat.category_content}</h3>
                    <p className="text-muted small">{cat.category_description || "Không có mô tả"}</p>
                    <button
                      className="btn btn-outline-primary btn-sm mt-2"
                      onClick={() => navigate(`/librarycontent/${cat._id}`)}
                    >
                      <i className="bi bi-arrow-right me-1"></i> Xem chi tiết
                    </button>
                  </div>
                ))
=======
          <a href="/">Trang chủ</a> <i className="fas fa-angle-right"></i>{" "}
          <a href="/LibraryTopic">Thư viện kiến thức</a> <i className="fas fa-angle-right"></i>{" "}
          <span>{topic?.topic_title || "Chủ đề không xác định"}</span>
        </div>

        <div style={{ textAlign: "right", marginBottom: "20px" }}>
          <Link to={`/library_categories/create/${topicId}`}>
            <button
              style={{
                padding: "8px 16px",
                backgroundColor: "#28a745",
                color: "#fff",
                border: "none",
                borderRadius: "5px",
              }}
            >
              + Tạo danh mục
            </button>
          </Link>
        </div>
      </div>

      <section className="library-section">
        <div className="container">
          <div className="library-content">
            {/* Sidebar */}
            <div className="sidebar">
              <h2 className="sidebar-title">Chuyên mục bài viết</h2>
              <ul className="sidebar-menu">
                {allCategories.length > 0 ? (
                  allCategories.map((cat) => (
                    <li key={cat._id}>
                      <div className="menu-item">
                        <a
                          href={`/librarycontent/${cat._id}`}
                          className="menu-link"
                          onClick={(e) => {
                            e.preventDefault();
                            navigate(`/librarycontent/${cat._id}`);
                          }}
                        >
                          {cat.category_content}
                        </a>
                      </div>
                    </li>
                  ))
                ) : (
                  <li>
                    <div className="menu-item">
                      <a href="#" className="menu-link">
                        Chưa có bài viết
                      </a>
                    </div>
                  </li>
                )}
              </ul>
            </div>

            {/* Content Grid */}
            <div className="content-grid" style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {allCategories.map((cat) => (
                <div
                  className="category-card"
                  key={cat._id}
                  style={{
                    width: "220px",
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  <div
                    className="card-image"
                    onClick={() => navigate(`/librarycontent/${cat._id}`)}
                    style={{ cursor: "pointer" }}
                  >
                    <img
                      src={cat.category_imageurl || "/default.jpg"}
                      alt={cat.category_content}
                      style={{
                        width: "100%",
                        height: "180px",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                  <div className="card-title" style={{ padding: "10px", fontWeight: "bold" }}>
                    {cat.category_description}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "0 10px 10px",
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
                      onClick={() => handleDelete(cat._id)}
                      style={{
                        backgroundColor: "#dc3545",
                        color: "#fff",
                        border: "none",
                        padding: "4px 8px",
                        borderRadius: "4px",
                      }}
                    >
                      Xoá
                    </button>
                  </div>
                </div>
              ))}
              {allCategories.length === 0 && (
                <div className="text-center" style={{ width: "100%" }}>
                  <p>Không có danh mục nào để hiển thị.</p>
                </div>
>>>>>>> Stashed changes
              )}
            </div>
          </div>
        </div>
      </section>

<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
      <Footer />
    </>
  );
};

export default LibraryCategory;
