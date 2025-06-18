import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { baseUrl } from '../config';

const UpdateLibraryTopic = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageurl, setImageurl] = useState("");
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    axios
      .get(`${baseUrl}/reptitist/topic-categories/library_topics/${id}`)
      .then((res) => {
        const topic = res.data;
        setTitle(topic.topic_title || "");
        setDescription(topic.topic_description || "");
        setImageurl(topic.topic_imageurl?.[0] || "");
      })
      .catch((error) => console.error("Lỗi khi tải dữ liệu:", error));
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${baseUrl}/reptitist/library_topics/${id}`, {
        topic_title: title,
        topic_description: description,
        topic_imageurl: [imageurl],
      });
      navigate("/Library");
    } catch (error) {
      console.error("Lỗi khi cập nhật:", error);
    }
  };

  return (
    <>
      <Header />
      <div className="page-title">
        <div className="container">
          <h1>Cập Nhật Chủ Đề</h1>
        </div>
      </div>

      <div className="container">
        <form onSubmit={handleUpdate} style={{ maxWidth: "600px", margin: "0 auto" }}>
          <div className="form-group" style={{ marginBottom: "16px" }}>
            <label>Tiêu đề</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="form-control"
              placeholder="Cập nhật tiêu đề..."
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
              placeholder="Cập nhật mô tả..."
            />
          </div>

          <div className="form-group" style={{ marginBottom: "16px" }}>
            <label>Hình ảnh (URL)</label>
            <input
              type="text"
              value={imageurl}
              onChange={(e) => setImageurl(e.target.value)}
              className="form-control"
              placeholder="Cập nhật đường dẫn hình ảnh..."
            />
          </div>

          <button type="submit" className="btn btn-warning">
            Cập nhật
          </button>
        </form>
      </div>

      <Footer />
    </>
  );
};

export default UpdateLibraryTopic;
