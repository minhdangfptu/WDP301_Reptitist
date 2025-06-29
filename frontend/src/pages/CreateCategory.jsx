import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { baseUrl } from '../config';

const CreateCategory = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    category_content: "",
    category_description: "",
    category_imageurl: "",
    topic_id: topicId || "",
  });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(`${baseUrl}/reptitist/library_categories/topic/${topicId}`, formData);
      navigate(`/libraryCategory/${topicId}`);
    } catch (err) {
      setError("Không thể tạo danh mục. Vui lòng thử lại.");
    }
  };

  return (
    <>
      <Header />
      <div className="container my-5">
        <h2 className="text-center mb-4">Tạo danh mục mới</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit} style={{ maxWidth: "600px", margin: "0 auto" }}>
          <div className="form-group mb-3">
            <label>Nội dung danh mục</label>
            <input
              type="text"
              name="category_content"
              value={formData.category_content}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>
          <div className="form-group mb-3">
            <label>Mô tả danh mục</label>
            <textarea
              name="category_description"
              value={formData.category_description}
              onChange={handleChange}
              className="form-control"
              rows="3"
            />
          </div>
          <div className="form-group mb-3">
            <label>URL hình ảnh</label>
            <input
              type="text"
              name="category_imageurl"
              value={formData.category_imageurl}
              onChange={handleChange}
              className="form-control"
            />
          </div>
          <button type="submit" className="btn btn-success">
            Tạo danh mục
          </button>
        </form>
      </div>
      <Footer />
    </>
  );
};

export default CreateCategory;