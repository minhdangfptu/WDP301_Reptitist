import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { baseUrl } from "../config";
import { FaSearch, FaTimes, FaPlus } from 'react-icons/fa'; // Giữ icons từ giao diện 2

const Library = () => {
  const [topics, setTopics] = useState([]);
  const [reptiles, setReptiles] = useState([]);
  const [filteredTopics, setFilteredTopics] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [openIndex, setOpenIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [deleteTopicId, setDeleteTopicId] = useState(null); // Thêm để lưu topicId khi xóa
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user && user.role === "admin";

  // Giữ logic lấy dữ liệu từ giao diện 2
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
            setLoading(false);
            throw new Error("Lỗi khi tải dữ liệu");
          });
        setFilteredTopics(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Lỗi khi lấy danh sách chủ đề:", error);
        setLoading(false);
        throw new Error("Lỗi khi tải dữ liệu");
      });
  }, []);

  const getAllReptileInformation = async () => {
    try {
      const response = await axios.get(
        `${baseUrl}/reptitist/info/get-all-reptile`
      );
      return response.data.data;
    } catch (err) {
      throw new Error("Lỗi khi tải dữ liệu");
    }
  };

  // Giữ debounce cho tìm kiếm từ giao diện 2
  useEffect(() => {
    const debounce = setTimeout(() => {
      const filtered = topics.filter((topic) =>
        topic.topic_title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredTopics(filtered);
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm, topics]);

  const toggleTopic = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Modal cho xóa, thay confirm/alert từ giao diện 1
  const handleDelete = (topicId) => {
    setShowModal(true);
    setModalMessage("Bạn có chắc chắn muốn xóa chủ đề này?");
    setDeleteTopicId(topicId);
    return async () => {
      try {
        await axios.delete(
          `${baseUrl}/reptitist/topic-categories/library_topics/${topicId}`
        );
        setTopics(topics.filter((topic) => topic._id !== topicId));
        setModalMessage("Xóa chủ đề thành công!");
      } catch (error) {
        console.error("Lỗi khi xóa chủ đề:", error);
        setModalMessage("Có lỗi xảy ra khi xóa chủ đề!");
      }
    };
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  if (loading) {
    return (
      // Giữ skeleton loader với loading.gif từ giao diện 2
      <div
        className="text-center my-5"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "18px",
        }}
      >
        <img src="./loading.gif" alt="Đang tải" />
        Đang tải danh sách chủ đề...
      </div>
    );
  }

  return (
    <>
      <Header />

      {/* Page title từ giao diện 1 */}
      <div className="page-title">
        <div className="container">
          <h1>THƯ VIỆN KIẾN THỨC</h1>
        </div>
      </div>

      <div className="container">
        {/* Breadcrumb từ giao diện 1 */}
        <div className="breadcrumb">
          <Link to="/">Trang chủ</Link> <i className="fas fa-angle-right"></i>{" "}
          <span>Thư viện kiến thức</span>
        </div>

        {/* Thanh tìm kiếm từ giao diện 1, giữ icons từ giao diện 2 */}
        <div className="row mb-3">
          <div className="col-md-3"></div>
          <div className="col-md-6">
            <div className="input-group" style={{ position: "relative" }}>
              <FaSearch style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#666" }} />
              <input
                type="text"
                className="form-control"
                placeholder="Tìm kiếm theo tên chủ đề..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: "35px" }}
                aria-label="Tìm kiếm chủ đề"
              />
              {searchTerm && (
                <FaTimes
                  style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: "#666" }}
                  onClick={clearSearch}
                  aria-label="Xóa tìm kiếm"
                />
              )}
            </div>
          </div>
          <div className="col-md-3 text-end">
            {isAdmin && (
              <Link to="/library_topics/create">
                <button className="btn btn-success">
                  <FaPlus style={{ marginRight: "5px" }} /> Tạo chủ đề
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <section className="library-section">
        <div className="container">
          <div className="library-content">
            {/* Sidebar từ giao diện 1, giữ "Thư viện chuyên sâu" từ giao diện 2 */}
            <div className="sidebar">
              <h2 className="sidebar-title">Chủ đề thư viện</h2>
              <ul className="sidebar-menu list-unstyled">
                {filteredTopics.map((topic, idx) => (
                  <li key={topic._id}>
                    <div
                      className="menu-item"
                      onClick={() => toggleTopic(idx)}
                      style={{ cursor: "pointer", userSelect: "none" }}
                      role="button"
                      aria-expanded={openIndex === idx}
                    >
                      <Link to="#" className="menu-link">
                        {topic.topic_title}
                      </Link>
                      <span
                        className={`caret ${openIndex === idx ? "caret-up" : "caret-down"}`}
                        aria-hidden="true"
                      ></span>
                    </div>
                    <ul
                      className="submenu"
                      style={{ display: openIndex === idx ? "block" : "none" }}
                    >
                      <li>
                        <Link to={`/libraryCategory/${topic._id}`}>
                          {topic.topic_description || "Chưa có mô tả"}
                        </Link>
                      </li>
                    </ul>
                  </li>
                ))}
              </ul>
              
              <h2 className="sidebar-title mt-4">Thư viện chuyên sâu</h2>
              <Link to="/LibraryExpert">
                <button
                  style={{
                    width: "100%",
                    padding: "8px 16px",
                    backgroundColor: "#06a13d",
                    color: "#fff",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    marginTop: "20px",
                    fontWeight: "bold",
                    transition: "background-color 0.2s ease",
                  }}
                >
                  Thư viện chuyên sâu
                </button>
              </Link>
            </div>

            {/* Content Grid từ giao diện 1 */}
            <div className="content-grid">
              {filteredTopics.map((topic) => (
                <div className="category-card" key={topic._id}>
                  <Link to={`/libraryCategory/${topic._id}`}>
                    <div className="card-image" style={{ cursor: "pointer" }}>
                      <img
                        src={
                          topic.topic_imageurl?.[0] ||
                          "https://cdn.pixabay.com/photo/2017/01/31/15/06/dinosaurs-2022584_960_720.png"
                        }
                        alt={topic.topic_title}
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
                          onClick={() => {
                            const confirmDelete = handleDelete(topic._id);
                            confirmDelete();
                          }}
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
                      : "Không có chủ đề nào để hiển thị."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Modal từ giao diện 2 */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "8px",
              textAlign: "center",
              maxWidth: "400px",
            }}
          >
            <p>{modalMessage}</p>
            {modalMessage.includes("chắc chắn") ? (
              <>
                <button
                  className="btn btn-primary"
                  style={{ marginRight: "10px" }}
                  onClick={async () => {
                    const confirmDelete = handleDelete(deleteTopicId);
                    await confirmDelete();
                    setShowModal(false);
                  }}
                >
                  Xác nhận
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Hủy
                </button>
              </>
            ) : (
              <button
                className="btn btn-primary"
                onClick={() => setShowModal(false)}
              >
                Đóng
              </button>
            )}
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default Library;