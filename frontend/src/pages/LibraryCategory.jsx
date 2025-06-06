import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
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

  return (
    <>
      <Header />
<<<<<<< Updated upstream
      <div className="page-title">
        <div className="container">
          <h1>Chi tiết danh mục</h1>
        </div>
      </div>

      <div className="container">
        <div className="breadcrumb">
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
              )}
            </div>
          </div>
        </div>
      </section>

>>>>>>> Stashed changes
      <Footer />
    </>
  );
};

export default LibraryCategory;
