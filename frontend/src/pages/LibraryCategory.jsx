import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import Footer from "../components/Footer";

const LibraryCategory = () => {
  const [allCategories, setAllCategories] = useState([]);
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { id: topicId } = useParams();

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

  return (
    <>
      <Header />

      <div className="page-title bg-light py-4">
        <div className="container text-center">
          <h1 className="fw-bold">DANH MỤC THƯ VIỆN</h1>
          <p className="text-muted">Chủ đề: {topic?.topic_title || "Không xác định"}</p>
        </div>
      </div>

      <div className="container">
        <div className="breadcrumb">
          <Link to="/">Trang chủ</Link> <i className="fas fa-angle-right mx-2"></i>
          <Link to="/LibraryTopic">Thư viện kiến thức</Link> <i className="fas fa-angle-right mx-2"></i>
          <span>{topic?.topic_title || "Chủ đề không xác định"}</span>
        </div>

        <div className="d-flex justify-content-end mb-3">
          <Link to={`/library_categories/create/${topicId}`}>
            <button className="btn btn-success">+ Tạo danh mục</button>
          </Link>
        </div>

        <div className="row row-cols-1 row-cols-md-3 g-4">
          {allCategories.map((cat) => (
            <div className="col" key={cat._id}>
              <div className="card h-100 shadow-sm border-0 d-flex flex-column">
                <img
                  src={cat.category_imageurl || "/default.jpg"}
                  className="card-img-top"
                  alt={cat.category_content}
                  style={{
                    height: "200px",
                    objectFit: "cover",
                    borderTopLeftRadius: "0.5rem",
                    borderTopRightRadius: "0.5rem",
                  }}
                />
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title text-primary">{cat.category_content}</h5>
                  <p className="card-text text-muted flex-grow-1">
                    {cat.category_description || "Chưa có mô tả"}
                  </p>
                  <div className="mt-auto d-flex justify-content-between">
                    <button
                      className="btn btn-outline-primary btn-sm me-2"
                      onClick={() => navigate(`/librarycontent/${cat._id}`)}
                    >
                      Xem nội dung
                    </button>
                    <Link to={`/library_categories/update/${cat._id}`}>
                      <button className="btn btn-warning btn-sm me-2">Cập nhật</button>
                    </Link>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(cat._id)}>
                      Xoá
                    </button>
                  </div>
                </div>
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

      <Footer />
    </>
  );
};

export default LibraryCategory;
