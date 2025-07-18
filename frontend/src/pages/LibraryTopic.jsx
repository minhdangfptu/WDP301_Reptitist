/* eslint-disable no-unreachable */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { baseUrl } from '../config';

const Library = () => {
  const [topics, setTopics] = useState([]);
  const [filteredTopics, setFilteredTopics] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [reptiles, setReptiles] = useState([]);
  const [openIndex, setOpenIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user && user.role === "admin";

  useEffect(() => {
    setLoading(true); 
    axios
      .get(`${baseUrl}/reptitist/topic-categories/library_topics`)
      .then((response) => {
        setTopics(response.data);
        getAllReptileInformation()
          .then((reptilesData) => {
            setReptiles(reptilesData);
            setLoading(false); 
          })
          .catch((error) => {
            window.alert('Lỗi khi tải dữ liệu về bò sát');
            setLoading(false); 
          });
        setFilteredTopics(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Lỗi khi lấy danh sách chủ đề:', error);
        window.alert('Lỗi khi tải dữ liệu về chủ đề');
        setLoading(false); 
      });
  }, []);
 const getAllReptileInformation = async () => {
    try {
      const response = await axios.get(`${baseUrl}/reptitist/info/get-all-reptile`);
      return response.data.data
      console.log(response.data, 'reptile data');
    } catch (err) {
      throw new Error('Lỗi khi tải dữ liệu');
    }
  };

  // Filter topics based on search term
  useEffect(() => {
    const filtered = topics.filter((topic) =>
      topic.topic_title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredTopics(filtered);
  }, [searchTerm, topics]);

  const toggleTopic = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleDelete = async (topicId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa chủ đề này?")) {
      try {
        await axios.delete(`${baseUrl}/reptitist/topic-categories/library_topics/${topicId}`);
        setTopics(topics.filter((topic) => topic._id !== topicId));
        alert("Xóa chủ đề thành công!");
      } catch (error) {
        console.error("Lỗi khi xóa chủ đề:", error);
        alert("Có lỗi xảy ra khi xóa chủ đề!");
      }
    }
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        Đang tải danh sách chủ đề...
      </div>
    );
  }

  return (
    <>
      <Header />

      <div className="page-title">
        <div className="container">
          <h1>THƯ VIỆN KIẾN THỨC</h1>
        </div>
      </div>

      <div className="container">
        <div className="breadcrumb">
          <Link to="/">Trang chủ</Link> <i className="fas fa-angle-right"></i>{" "}
          <span>Thư viện kiến thức</span>
        </div>

        <div className="row mb-3">
          <div className="col-md-3">
            {/* Empty space for left alignment */}
          </div>
          <div className="col-md-6">
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Tìm kiếm theo tên chủ đề..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              
            </div>
          </div>
          <div className="col-md-3 text-end">
            {isAdmin && (
              <Link to="/library_topics/create">
                <button className="btn btn-success">+ Tạo chủ đề</button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <section className="library-section">
        <div className="container">
           <div className="library-content d-flex">
            {/* Sidebar */}
            <div className="sidebar me-5" style={{ width: "250px" }}>
              <h2 className="sidebar-title">Chủ đề thư viện</h2>
              <ul className="sidebar-menu list-unstyled">
                {filteredTopics.map((topic, idx) => (
                  <li key={topic._id}>
                    <div
                      onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                      style={{
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <span>{topic.topic_title}</span>
                      <span
                        style={{
                          transform: openIndex === idx ? 'rotate(90deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s ease',
                          display: 'inline-block',
                        }}
                      >
                        ▶
                      </span>
                    </div>

                    {openIndex === idx && (
                      <ul style={{ paddingLeft: '15px', marginTop: '5px' }}>
                        <li>
                          <Link to={`/libraryCategory/${topic._id}`}>
                            {topic.topic_description || 'Chưa có mô tả'}
                          </Link>
                        </li>
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
              {isAdmin && (
                <div style={{ marginTop: '20px' }}>
                  <Link to="/library_topics/create">
                    <button
                      style={{
                        width: '100%',
                        padding: '8px 16px',
                        backgroundColor: '#28a745',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s ease',
                      }}
                    >
                      + Tạo chủ đề
                    </button>
                  </Link>
                </div>
              )}
              <h2 className="sidebar-title mt-4">Thư viện chuyên sâu</h2>
              <Link to="/LibraryExpert">
                <button
                  style={{
                    width: '100%',
                    padding: '8px 16px',
                    backgroundColor: '#06a13d',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    marginTop: '20px',
                    fontWeight: 'bold',
                    transition: 'background-color 0.2s ease',
                  }}
                >
                Thư viện chuyên sâu
                </button>
              </Link>
            </div>

            {/* Content Grid for Topics and Reptiles */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              {/* First row for topics */}
              <div
                className="content-grid"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '20px',
                }}
              >
                {topics.map((topic) => (
                  <div
                    className="category-card"
                    key={topic._id}
                    style={{
                      width: '100%',
                      border: '1px solid #ccc',
                      borderRadius: '8px',
                      padding: '15px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      transition: 'transform 0.2s ease',
                    }}
                  >
                    <Link to={`/libraryCategory/${topic._id}`}>
                      <div className="card-image" style={{ cursor: 'pointer' }}>
                        <img
                          src={topic.topic_imageurl?.[0] || 'https://cdn.pixabay.com/photo/2017/01/31/15/06/dinosaurs-2022584_960_720.png'}
                          alt={topic.topic_title}
                          style={{
                            width: '100%',
                            height: '200px',
                            objectFit: 'cover',
                            borderRadius: '4px',
                          }}
                        />
                      </div>
                    </Link>

                  <div className="card-title">{topic.topic_title}</div>
                  <div
                    style={{
                      marginTop: "10px",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    {isAdmin && (
                      <>
                        <Link to={`/library_topics/update/${topic._id}`}>
                          <button
                            style={{
                              backgroundColor: "#ffc107",
                              border: "none",
                              padding: "4px 8px",
                              borderRadius: "4px",
                            }}
                          >
                            Cập nhật
                          </button>
                        </Link>
                        <button
                          style={{
                            backgroundColor: "#dc3545",
                            color: "#fff",
                            border: "none",
                            padding: "4px 8px",
                            borderRadius: "4px",
                          }}
                          onClick={() => handleDelete(topic._id)}
                        >
                          Xoá
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
              {filteredTopics.length === 0 && (
                <div className="col-12 text-center mt-4">
                  <p>
                    {searchTerm 
                      ? `Không tìm thấy chủ đề nào với từ khóa "${searchTerm}"`
                      : "Không có chủ đề nào để hiển thị."
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
         </div>
      </section>
     

      <Footer />
    </>
  );
};

export default Library;