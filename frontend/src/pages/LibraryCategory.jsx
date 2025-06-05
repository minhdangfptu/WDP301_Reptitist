import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import Footer from "../components/Footer";

const LibraryCategory = () => {
  const { id } = useParams();
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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

  return (
    <>
      <Header />
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
      <Footer />
    </>
  );
};

export default LibraryCategory;
