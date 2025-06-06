import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import Footer from "../components/Footer";

const LibraryCategoryCreate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    category_content: "",
    category_description: "",
    category_imageurl: ""
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post("http://localhost:8080/reptitist/library_categories", formData)
      .then(() => {
        alert("Tạo danh mục thành công");
        navigate("http://localhost:8080/reptitist/library_categories/${id}");
      })
      .catch(() => {
        alert("Tạo thất bại");
      });
  };

  return (
    <>
      <Header />
      <div className="container my-4">
        <h2>Tạo danh mục mới</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Tên danh mục</label>
            <input
              type="text"
              name="category_content"
              className="form-control"
              value={formData.category_content}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Mô tả</label>
            <textarea
              name="category_description"
              className="form-control"
              rows="4"
              value={formData.category_description}
              onChange={handleChange}
            ></textarea>
          </div>
          <div className="mb-3">
            <label className="form-label">Link ảnh (nếu có)</label>
            <input
              type="text"
              name="category_imageurl"
              className="form-control"
              value={formData.category_imageurl}
              onChange={handleChange}
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Tạo danh mục
          </button>
        </form>
      </div>
      <Footer />
    </>
  );
};

export default LibraryCategoryCreate;
