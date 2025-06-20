import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";

// Cấu hình Axios để gửi token trong header
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const LibraryContent = () => {
  const { categoryId } = useParams();
  const [contents, setContents] = useState([]);
  const [category, setCategory] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedContentId, setSelectedContentId] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const { hasRole } = useAuth();

  // Lấy user_id từ token
  const getUserId = () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        return decoded.id; // Thay đổi từ user_id thành id
      } catch (err) {
        console.error("Lỗi giải mã token:", err);
        return null;
      }
    }
    return null;
  };

  const userId = getUserId();

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    image_urls: [],
    user_id: userId,
    topic_category_id: "",
    category_content_id: categoryId
  });
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);

    const fetchCategory = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/reptitist/library_categories/${categoryId}`
        );
        console.log("Category:", response.data);
        setCategory(response.data);
      } catch (err) {
        setError("Lỗi khi tải thông tin danh mục");
      }
    };

    const fetchContents = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8080/reptitist/library_contents"
        );
        const filtered = response.data.filter((item) => {
          console.log("item.category_content_id:", item.category_content_id, "categoryId:", categoryId);
          if (item.category_content_id && typeof item.category_content_id === "object") {
            if (item.category_content_id._id) {
              return String(item.category_content_id._id) === String(categoryId);
            }
            if (item.category_content_id.$oid) {
              return item.category_content_id.$oid === categoryId;
            }
          }
          return String(item.category_content_id) === String(categoryId);
        });
        console.log("Contents:", filtered);
        setContents(filtered);
      } catch (err) {
        setError("Lỗi khi tải nội dung thư viện");
      }
    };

    const fetchTopics = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8080/reptitist/library_topics"
        );
        setTopics(response.data);
      } catch (err) {
        setError("Lỗi khi tải danh sách chủ đề");
      }
    };

    Promise.all([fetchCategory(), fetchContents(), fetchTopics()]).then(() => {
      setLoading(false);
    });
  }, [categoryId]);

  // Cập nhật formData khi userId thay đổi
  useEffect(() => {
    const currentUserId = getUserId();
    setFormData(prev => ({
      ...prev,
      user_id: currentUserId
    }));
  }, []);

  const handleSelectContent = (contentId) => {
    setSelectedContentId(contentId);
    setIsCreating(false);
    setIsEditing(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "image_urls" ? value.split(",").map(url => url.trim()) : value
    }));
  };

  const handleImageFileChange = (index) => (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => {
          const newImages = [...(prev.image_urls || [])];
          newImages[index] = reader.result;
          return { ...prev, image_urls: newImages };
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    console.log("Bắt đầu handleCreate");
    console.log("userId:", userId);
    console.log("Token:", localStorage.getItem("token"));
    console.log("categoryId:", categoryId);
    console.log("Category:", category);
    
    // Kiểm tra đăng nhập
    if (!userId) {
      console.log("Chưa đăng nhập");
      setError("Vui lòng đăng nhập để tạo nội dung");
      navigate('/login', { state: { from: `/LibraryContent/${categoryId}` } });
      return;
    }
    
    // Kiểm tra dữ liệu trước khi gửi
    if (!formData.title.trim()) {
      console.log("Thiếu tiêu đề");
      setError("Vui lòng nhập tiêu đề");
      return;
    }
    if (!formData.content.trim()) {
      console.log("Thiếu nội dung");
      setError("Vui lòng nhập nội dung");
      return;
    }
    
    if (!category?.topic_id) {
      console.log("Không tìm thấy topic_id");
      setError("Không tìm thấy thông tin chủ đề");
      return;
    }
    
    try {
      console.log("Bắt đầu gửi request");
      // Chuẩn bị dữ liệu gửi đi
      const dataToSend = {
        ...formData,
        category_content_id: categoryId,
        image_urls: Array.isArray(formData.image_urls) ? formData.image_urls : [],
        user_id: userId,
        topic_category_id: category.topic_id // Sử dụng topic_id từ category hiện tại
      };

      const apiUrl = "http://localhost:8080/reptitist/library_contents";
      console.log("API URL:", apiUrl);
      console.log("Dữ liệu gửi đi:", JSON.stringify(dataToSend, null, 2));
      console.log("Headers:", {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json"
      });

      const response = await axios.post(apiUrl, dataToSend);
      console.log("Phản hồi từ server:", response.data);
      
      // Reset form và cập nhật danh sách
      setIsCreating(false);
      setFormData({
        title: "",
        content: "",
        image_urls: [],
        user_id: userId,
        topic_category_id: category.topic_id,
        category_content_id: categoryId
      });
      
      // Cập nhật danh sách nội dung
      console.log("Cập nhật danh sách nội dung");
      const contentsResponse = await axios.get(apiUrl);
      const filtered = contentsResponse.data.filter((item) => {
        if (item.category_content_id && typeof item.category_content_id === "object") {
          if (item.category_content_id._id) {
            return String(item.category_content_id._id) === String(categoryId);
          }
          if (item.category_content_id.$oid) {
            return String(item.category_content_id.$oid) === String(categoryId);
          }
        }
        return String(item.category_content_id) === String(categoryId);
      });
      setContents(filtered);
      
      // Hiển thị thông báo thành công
      setError(null);
      alert("Tạo nội dung thành công!");
      
    } catch (err) {
      console.error("Chi tiết lỗi:", {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        headers: err.response?.headers,
        config: {
          url: err.config?.url,
          method: err.config?.method,
          data: err.config?.data,
          headers: err.config?.headers
        }
      });
      setError(err.response?.data?.message || "Lỗi khi tạo nội dung. Vui lòng kiểm tra lại thông tin.");
    }
  };

  // Thêm log cho form submit
  const handleFormSubmit = (e) => {
    console.log("Form submit");
    if (isCreating) {
      handleCreate(e);
    } else if (isEditing) {
      handleUpdate(e);
    }
  };

  const handleEdit = () => {
    const content = contents.find((item) => item._id === selectedContentId);
    if (content) {
      setFormData({
        title: content.title,
        content: content.content,
        image_urls: content.image_urls,
        user_id: userId || content.user_id,
        topic_category_id: content.topic_category_id,
        category_content_id: categoryId
      });
      setIsEditing(true);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!formData.topic_category_id) {
      setError("Vui lòng chọn chủ đề");
      return;
    }
    try {
      const response = await axios.put(
        `http://localhost:8080/reptitist/library_contents/${selectedContentId}`,
        {
          ...formData,
          category_content_id: categoryId
        }
      );
      setContents((prevContents) =>
        prevContents.map((item) =>
          item._id === selectedContentId ? { ...item, ...response.data.content } : item
        )
      );
      setIsEditing(false);
      setSelectedContentId(null);
    } catch (err) {
      setError("Lỗi khi cập nhật nội dung");
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Bạn có chắc muốn xóa nội dung này?")) {
      try {
        await axios.delete(`http://localhost:8080/reptitist/library_contents/${selectedContentId}`);
        const response = await axios.get("http://localhost:8080/reptitist/library_contents");
        const filtered = response.data.filter((item) => {
          if (item.category_content_id && typeof item.category_content_id === "object") {
            if (item.category_content_id._id) {
              return String(item.category_content_id._id) === String(categoryId);
            }
            if (item.category_content_id.$oid) {
              return String(item.category_content_id.$oid) === String(categoryId);
            }
          }
          return String(item.category_content_id) === String(categoryId);
        });
        setContents(filtered);
        setSelectedContentId(null);
      } catch (err) {
        setError("Lỗi khi xóa nội dung");
      }
    }
  };

  if (loading) return <div className="text-center my-5">Đang tải dữ liệu...</div>;
  if (error) return <div className="text-danger text-center my-5">{error}</div>;

  const selectedContent = contents.find((item) => item._id === selectedContentId);

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
          <a href="/">Trang chủ</a> <i className="fas fa-angle-right"></i>{" "}
          <a href="/LibraryTopic">Thư viện kiến thức</a>{" "}
          <i className="fas fa-angle-right"></i>{" "}
          <a href={`/LibraryCategory/${category?.topic_id}`}>
            {category?.topic_title || "Chủ đề không xác định"}
          </a>{" "}
          <i className="fas fa-angle-right"></i>{" "}
          <span>{category?.category_content || "Danh mục không xác định"}</span>
        </div>
      </div>

      <section className="library-section">
        <div className="container">
          <div className="library-content">
            <div className="sidebar">
              <h2 className="sidebar-title">Chuyên mục bài viết</h2>
              <ul className="sidebar-menu">
                {contents.length > 0 ? (
                  contents.map((item) => (
                    <li key={item._id}>
                      <div className="menu-item">
                        <a
                          href="#"
                          className={`menu-link ${selectedContentId === item._id ? "active" : ""}`}
                          onClick={(e) => {
                            e.preventDefault();
                            handleSelectContent(item._id);
                          }}
                        >
                          {item.title}
                        </a>
                      </div>
                    </li>
                  ))
                ) : (
                  <li>
                    <div className="menu-item">
                      <a href="#" className="menu-link">
                        Chưa có bài viết
                      </a>
                    </div>
                  </li>
                )}
              </ul>
            </div>

            <div
              className="content-grid"
              style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}
            >
              {/* Nút tạo mới nội dung */}
              {hasRole("admin") && (
                <div style={{ width: "100%", marginBottom: "10px" }}>
                  <button
                    style={{
                      padding: "10px 20px",
                      backgroundColor: "#28a745",
                      color: "white",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer"
                    }}
                    onClick={() => {
                      setIsCreating(true);
                      setIsEditing(false);
                      setSelectedContentId(null);
                    }}
                  >
                    Tạo mới nội dung
                  </button>
                </div>
              )}

              {(isCreating || isEditing) && (
                <div style={{ width: "100%", marginBottom: "20px" }}>
                  <form
                    onSubmit={handleFormSubmit}
                    style={{
                      padding: "20px",
                      border: "1px solid #ccc",
                      borderRadius: "5px",
                      backgroundColor: "#f9f9f9"
                    }}
                  >
                    <h3>{isCreating ? "Tạo nội dung mới" : "Cập nhật nội dung"}</h3>
                    <div style={{ marginBottom: "10px" }}>
                      <label>Tiêu đề:</label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleFormChange}
                        style={{ width: "100%", padding: "5px" }}
                        required
                      />
                    </div>
                    
                    <div style={{ marginBottom: "10px" }}>
                      <label>Nội dung:</label>
                      <textarea
                        name="content"
                        value={formData.content}
                        onChange={handleFormChange}
                        style={{ width: "100%", padding: "5px", height: "100px" }}
                        required
                      />
                    </div>
                    <div style={{ marginBottom: "10px" }}>
                      <label>Hình ảnh (tối đa 3 ảnh, mỗi ảnh 1 file):</label>
                      {[0,1,2].map((idx) => (
                        <div key={idx} style={{ marginBottom: 8 }}>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageFileChange(idx)}
                            style={{ width: "100%", padding: "5px" }}
                          />
                          {formData.image_urls && formData.image_urls[idx] && (
                            <img src={formData.image_urls[idx]} alt={`preview-${idx}`} style={{ maxWidth: 80, maxHeight: 80, border: '1px solid #ccc', marginTop: 4 }} />
                          )}
                        </div>
                      ))}
                    </div>
                    <div style={{ marginBottom: "10px" }}>
                      <button
                        type="submit"
                        style={{
                          padding: "10px 20px",
                          backgroundColor: isCreating ? "#28a745" : "#007bff",
                          color: "white",
                          border: "none",
                          borderRadius: "5px",
                          cursor: "pointer"
                        }}
                      >
                        {isCreating ? "Tạo" : "Cập nhật"}
                      </button>
                      <button
                        type="button"
                        style={{
                          padding: "10px 20px",
                          backgroundColor: "#6c757d",
                          color: "white",
                          border: "none",
                          borderRadius: "5px",
                          marginLeft: "10px",
                          cursor: "pointer"
                        }}
                        onClick={() => {
                          setIsCreating(false);
                          setIsEditing(false);
                          setFormData({
                            title: "",
                            content: "",
                            image_urls: [],
                            user_id: userId,
                            topic_category_id: "",
                            category_content_id: categoryId
                          });
                        }}
                      >
                        Hủy
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {selectedContent && !isCreating && !isEditing && hasRole("admin") && (
                <div style={{ marginBottom: "10px" }}>
                  <button
                    style={{
                      padding: "10px 20px",
                      backgroundColor: "#007bff",
                      color: "white",
                      border: "none",
                      borderRadius: "5px",
                      marginRight: "10px",
                      cursor: "pointer"
                    }}
                    onClick={handleEdit}
                  >
                    Cập nhật
                  </button>
                  <button
                    style={{
                      padding: "10px 20px",
                      backgroundColor: "#dc3545",
                      color: "white",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer"
                    }}
                    onClick={handleDelete}
                  >
                    Xóa
                  </button>
                </div>
              )}

              {selectedContent && !isCreating && !isEditing ? (
                <div style={{ width: "100%" }}>
                  <div className="mb-4 p-3 border rounded">
                    {selectedContent.image_urls && selectedContent.image_urls.length > 0 && (
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(2, 1fr)",
                          gridTemplateRows: "repeat(2, 1fr)",
                          gap: "10px",
                          maxWidth: "710px",
                          marginBottom: "10px"
                        }}
                      >
                        {selectedContent.image_urls.slice(0, 3).map((img, index) => (
                          <img
                            key={index}
                            src={img}
                            alt={`image-${index}`}
                            style={{
                              maxWidth: "100%",
                              height: "auto",
                              objectFit: "cover",
                              ...(index === 0
                                ? { gridColumn: "1 / 2", gridRow: "1 / 3", width: "500px", height: "300px" }
                                : index === 1
                                ? { gridColumn: "2 / 3", gridRow: "1 / 2", width: "200px", height: "145px" }
                                : { gridColumn: "2 / 3", gridRow: "2 / 3", width: "200px", height: "145px" })
                            }}
                          />
                        ))}
                      </div>
                    )}
                    <div dangerouslySetInnerHTML={{ __html: selectedContent.content }} />
                  </div>
                </div>
              ) : (
                contents.length === 0 ? (
                  <div className="text-center" style={{ width: "100%" }}>
                    <p>Chưa có nội dung nào trong danh mục này.</p>
                  </div>
                ) : (
                  contents.map((item) => (
                    <div
                      className="category-card"
                      key={item._id}
                      style={{ width: "220px", cursor: "pointer" }}
                      onClick={() => handleSelectContent(item._id)}
                    >
                      <div className="card-image">
                        <img
                          src={
                            item.image_urls && item.image_urls.length > 0
                              ? item.image_urls[0]
                              : "/default.jpg"
                          }
                          alt={item.title}
                          style={{
                            width: "100%",
                            height: "180px",
                            objectFit: "cover"
                          }}
                        />
                      </div>
                      <div className="card-title">{item.title}</div>
                    </div>
                  ))
                )
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default LibraryContent;