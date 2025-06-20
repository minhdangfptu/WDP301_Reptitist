import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

const UpdateCategory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    category_content: "",
    category_description: "",
    category_imageurl: "",
    topic_id: "",
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get(`http://localhost:8080/reptitist/library_categories/${id}`)
      .then((response) => {
        console.log(response.data); // Kiểm tra dữ liệu trả về
        setFormData(response.data);
      })
      .catch(() => setError("Không thể tải thông tin danh mục."));
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, category_imageurl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:8080/reptitist/library_categories/${id}`, formData);
      navigate(`/libraryCategory/${formData.topic_id._id}`);
    } catch (err) {
      setError("Không thể cập nhật danh mục. Vui lòng thử lại.");
    }
  };

  return (
    <>
      <Header />
      <div className="container my-5">
        <h2 className="text-center mb-4">Cập nhật danh mục</h2>
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
            <label>Hình ảnh (chọn file)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="form-control"
            />
            {formData.category_imageurl && (
              <img src={formData.category_imageurl} alt="Preview" style={{ maxWidth: '100%', marginTop: 8 }} />
            )}
          </div>
          <button type="submit" className="btn btn-warning">
            Cập nhật danh mục
          </button>
        </form>
      </div>
      <Footer />
    </>
  );
};

export default UpdateCategory;
