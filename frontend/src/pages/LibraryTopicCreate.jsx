import React, { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { baseUrl } from "../config";
const CreateLibraryTopic = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageurl, setImageurl] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newTopic = {
      topic_title: title,
      topic_description: description,
      topic_imageurl: [imageurl],
    };
    try {
      await axios.post(
        `${baseUrl}/reptitist/topic-categories/library_topics`,
        newTopic
      );
      navigate("/LibraryTopic");
    } catch (error) {
      console.error("Lỗi khi tạo chủ đề:", error);
    }
  };
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageurl(reader.result); // base64 string
      };
      reader.readAsDataURL(file);
    }
  };
  return (
    <>
      <Header />
      <div className="page-title">
        <div className="container">
          <h1>Tạo Chủ Đề Mới</h1>
        </div>
      </div>

      <div
        className="container"
        style={{
          margin: "30px auto",
          padding: "15px",
          backgroundColor: "white",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          maxWidth: "600px",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <form
          onSubmit={handleSubmit}
          style={{
            width: "100%",
            maxWidth: "400px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <div className="form-group" style={{ marginBottom: "16px" }}>
            <label>Tiêu đề</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="form-control"
              placeholder="Nhập tiêu đề chủ đề..."
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: "16px" }}>
            <label>Mô tả</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-control"
              rows="3"
              placeholder="Nhập mô tả chủ đề..."
            />
          </div>

          <div className="form-group" style={{ marginBottom: "16px" }}>
            <label>Hình ảnh (chọn file)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="form-control"
            />
            {imageurl && (
              <img
                src={imageurl}
                alt="Preview"
                style={{ maxWidth: "100%", marginTop: 8 }}
              />
            )}
          </div>

          <button type="submit" className="btn btn-success">
            Tạo chủ đề
          </button>
        </form>
      </div>

      <Footer />
    </>
  );
};

export default CreateLibraryTopic;
