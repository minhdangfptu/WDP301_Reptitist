import React, { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { baseUrl } from '../config';

const LibraryExpertTopicCreate = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageurl, setImageurl] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newTopic = {
      topic_title: title,
      topic_description: description,
      topic_imageurl: [imageurl]
    };
    try {
      await axios.post(`${baseUrl}/reptitist/topic-categories/library_expert_topics`, newTopic);
      navigate("/LibraryExpert");
    } catch (error) {
      alert("Lỗi khi tạo chủ đề!");
    }
  };

  return (
    <>
      <Header />
      <div className="page-title">
        <div className="container">
          <h1>TẠO CHỦ ĐỀ CHUYÊN SÂU</h1>
        </div>
      </div>
      <div className="container">
        <form onSubmit={handleSubmit} style={{ maxWidth: "600px", margin: "0 auto" }}>
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
            <label>Hình ảnh (URL)</label>
            <input
              type="text"
              value={imageurl}
              onChange={(e) => setImageurl(e.target.value)}
              className="form-control"
              placeholder="Nhập đường dẫn hình ảnh..."
            />
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

export default LibraryExpertTopicCreate; 