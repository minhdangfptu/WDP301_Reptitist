import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import Footer from "../components/Footer";
const baseUrl = import.meta.env.VITE_BACKEND_URL;
const LibraryCategory = () => {
  const [allCategories, setAllCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${baseUrl}/reptitist/library_categories`)
      .then((response) => {
        setAllCategories(response.data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Lỗi khi tải danh sách danh mục");
        setLoading(false);
      });
  }, []);

  if (loading)
    return <div className="text-center my-5">Đang tải dữ liệu...</div>;
  if (error)
    return <div className="text-danger text-center my-5">{error}</div>;

  return (
  <>
    <Header />
    <div className="container my-5">
      <h2 className="text-center mb-4">📚 Danh mục Thư viện</h2>
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
                <h5 style={{marginLeft: "-840px"}} className="card-title text-primary">{cat.category_content}</h5>
                <p className="card-text text-muted flex-grow-1">
                  {cat.category_description || "Chưa có mô tả"}
                </p>
                <div className="mt-auto">
                  <button
                    className="btn btn-outline-primary btn-sm w-100"
                    onClick={() => navigate(`/librarycontent/${cat._id}`)}
                  >
                    Xem nội dung
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
