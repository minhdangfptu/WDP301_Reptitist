import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { baseUrl } from "../config";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../css/LibraryDetail.css";
import { useAuth } from "../context/AuthContext";

const LibraryExpertDetail = () => {
  const { reptileId } = useParams();
  const [reptile, setReptile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, logout, hasRole, } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${baseUrl}/reptitist/info/get-all-reptile`)
      .then((res) => {
        const found = res.data.data.find((r) => r._id === reptileId);
        setReptile(found);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [reptileId]);

  const handleDelete = async () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa chủ đề này?")) {
      const token = localStorage.getItem("access_token"); // Lấy token từ localStorage

      try {
        await axios.delete(
          `${baseUrl}/reptitist/info/delete-reptile?id=${reptile._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        alert("Đã xóa thành công!");
        navigate("/LibraryExpert");
      } catch (err) {
        console.error("Lỗi khi xóa:", err.response?.data || err.message);
        alert("Bạn không có quyền xóa hoặc đã hết phiên đăng nhập!");
      }
    }
  };

  if (loading)
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
        {/* Header */}
        <div
          style={{
            backgroundColor: "#28a745",
            color: "white",
            padding: "60px 0",
            textAlign: "center",
          }}
        >
          <div className="container">
            <h1 style={{ fontSize: "2.5rem", fontWeight: "bold", margin: 0 }}>
              ĐANG TẢI...
            </h1>
          </div>
        </div>

        <div className="container" style={{ padding: "50px 15px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              minHeight: "400px",
            }}
          >
            <div
              className="spinner-border text-success"
              role="status"
              style={{ width: "3rem", height: "3rem", marginBottom: "20px" }}
            >
              <span className="visually-hidden">Loading...</span>
            </div>
            <p style={{ fontSize: "18px", color: "#6c757d" }}>
              Đang tải dữ liệu...
            </p>
          </div>
        </div>
      </div>
    );

  if (!reptile)
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
        <div
          className="container"
          style={{ padding: "100px 15px", textAlign: "center" }}
        >
          <i
            className="fas fa-exclamation-triangle"
            style={{ fontSize: "4rem", color: "#ffc107", marginBottom: "20px" }}
          ></i>
          <h3 style={{ color: "#2c3e50", marginBottom: "10px" }}>
            Không tìm thấy thông tin
          </h3>
          <p style={{ color: "#6c757d" }}>Không tìm thấy thông tin bò sát.</p>
          <Link to="/LibraryExpert" className="btn btn-success">
            Quay lại danh sách
          </Link>
        </div>
      </div>
    );

  return (
    <>
      <Header />
      <div className="page-title-banner">
        <h1>{reptile.common_name}</h1>
      </div>
      <div className="container">
        <div className="breadcrumb" style={{ marginBottom: "0px", paddingBottom: "0px" }}>
          <Link to="/">Trang chủ</Link> <i className="fas fa-angle-right"></i>{" "}
          <Link to="/LibraryExpert">Thư viện chuyên sâu</Link>{" "}
          <i className="fas fa-angle-right"></i>{" "}
          <span>{reptile.common_name}</span>
        </div>
        <div className="container" style={{ padding: "20px 15px" }}>
          {/* Action Buttons */}
          {hasRole("admin") && (
            <div className="row mb-4">
              <div className="col-12 text-center">
                <div
                  className="card"
                  style={{
                    border: "none",
                    borderRadius: "15px",
                    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                    padding: "20px",
                    backgroundColor: "white",
                  }}
                >
                  <div className="d-flex justify-content-center gap-3">
                    <button
                      className="btn btn-danger"
                      onClick={handleDelete}
                      style={{
                        borderRadius: "25px",
                        padding: "12px 30px",
                        fontWeight: "600",
                        fontSize: "14px",
                        border: "none",
                        boxShadow: "0 4px 15px rgba(220, 53, 69, 0.3)",
                        transition: "all 0.3s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = "translateY(-2px)";
                        e.target.style.boxShadow =
                          "0 6px 20px rgba(220, 53, 69, 0.4)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = "translateY(0)";
                        e.target.style.boxShadow =
                          "0 4px 15px rgba(220, 53, 69, 0.3)";
                      }}
                    >
                      <i className="fas fa-trash me-2"></i>
                      Xóa
                    </button>
                    <button
                      className="btn btn-warning"
                      onClick={() =>
                        navigate(`/libraryExpertDetail/update/${reptile._id}`)
                      }
                      style={{
                        borderRadius: "25px",
                        padding: "12px 30px",
                        fontWeight: "600",
                        fontSize: "14px",
                        border: "none",
                        color: "#212529",
                        boxShadow: "0 4px 15px rgba(255, 193, 7, 0.3)",
                        transition: "all 0.3s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = "translateY(-2px)";
                        e.target.style.boxShadow =
                          "0 6px 20px rgba(255, 193, 7, 0.4)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = "translateY(0)";
                        e.target.style.boxShadow =
                          "0 4px 15px rgba(255, 193, 7, 0.3)";
                      }}
                    >
                      <i className="fas fa-edit me-2"></i>
                      Cập nhật
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main Content Card */}
          <div className="row">
            <div className="col-12">
              <div
                className="card"
                style={{
                  border: "none",
                  borderRadius: "20px",
                  boxShadow: "0 8px 30px rgba(0,0,0,0.1)",
                  overflow: "hidden",
                  backgroundColor: "white",
                }}
              >
                <div className="card-body" style={{ padding: "40px" }}>
                  {/* Image and Basic Info */}
                  <div className="row mb-5">
                    <div className="col-lg-5 text-center mb-4 mb-lg-0">
                      <div
                        style={{
                          position: "relative",
                          display: "inline-block",
                          borderRadius: "20px",
                          overflow: "hidden",
                          boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                        }}
                      >
                        <img
                          src={
                            reptile.reptile_imageurl ||
                            "/feature_bosat.png"

                          }
                          alt={reptile.common_name}
                          style={{
                            width: "100%",
                            maxWidth: "400px",
                            height: "300px",
                            objectFit: "cover",
                          }}
                        />
                      </div>
                    </div>
                    <div className="col-lg-7">
                      <h2
                        style={{
                          fontSize: "2.5rem",
                          fontWeight: "700",
                          color: "#2c3e50",
                          marginBottom: "20px",
                          textAlign: "center",
                        }}
                      >
                        {reptile.common_name}
                      </h2>

                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <div
                            className="info-card"
                            style={{
                              backgroundColor: "#f8f9fa",
                              padding: "20px",
                              borderRadius: "15px",
                              border: "1px solid #e9ecef",
                            }}
                          >
                            <h6
                              style={{
                                color: "#28a745",
                                fontWeight: "600",
                                marginBottom: "10px",
                              }}
                            >
                              <i className="fas fa-dna me-2"></i>
                              Tên khoa học
                            </h6>
                            <p
                              style={{
                                margin: 0,
                                fontSize: "16px",
                                fontStyle: "italic",
                              }}
                            >
                              {reptile.specific_name || "Không rõ"}
                            </p>
                          </div>
                        </div>
                        <div className="col-md-6 mb-3">
                          <div
                            className="info-card"
                            style={{
                              backgroundColor: "#f8f9fa",
                              padding: "20px",
                              borderRadius: "15px",
                              border: "1px solid #e9ecef",
                            }}
                          >
                            <h6
                              style={{
                                color: "#28a745",
                                fontWeight: "600",
                                marginBottom: "10px",
                              }}
                            >
                              <i className="fas fa-palette me-2"></i>
                              Biến thể/Giống
                            </h6>
                            <p style={{ margin: 0, fontSize: "16px" }}>
                              {reptile.breed_or_morph || "Không rõ"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Classification */}
                  <div className="mb-5">
                    <h4
                      style={{
                        color: "#2c3e50",
                        fontWeight: "600",
                        marginBottom: "25px",
                        borderBottom: "3px solid #28a745",
                        paddingBottom: "10px",
                      }}
                    >
                      <i className="fas fa-sitemap me-2"></i>
                      Phân loại
                    </h4>
                    <div className="row">
                      <div className="col-md-4 mb-3">
                        <div
                          style={{
                            backgroundColor: "#e8f5e8",
                            padding: "20px",
                            borderRadius: "15px",
                            textAlign: "center",
                            border: "2px solid #28a745",
                          }}
                        >
                          <strong
                            style={{ color: "#28a745", fontSize: "14px" }}
                          >
                            CLASS
                          </strong>
                          <p
                            style={{
                              margin: "8px 0 0 0",
                              fontSize: "18px",
                              fontWeight: "600",
                            }}
                          >
                            {reptile.reptile_category?.class}
                          </p>
                        </div>
                      </div>
                      <div className="col-md-4 mb-3">
                        <div
                          style={{
                            backgroundColor: "#e8f5e8",
                            padding: "20px",
                            borderRadius: "15px",
                            textAlign: "center",
                            border: "2px solid #28a745",
                          }}
                        >
                          <strong
                            style={{ color: "#28a745", fontSize: "14px" }}
                          >
                            ORDER
                          </strong>
                          <p
                            style={{
                              margin: "8px 0 0 0",
                              fontSize: "18px",
                              fontWeight: "600",
                            }}
                          >
                            {reptile.reptile_category?.order}
                          </p>
                        </div>
                      </div>
                      <div className="col-md-4 mb-3">
                        <div
                          style={{
                            backgroundColor: "#e8f5e8",
                            padding: "20px",
                            borderRadius: "15px",
                            textAlign: "center",
                            border: "2px solid #28a745",
                          }}
                        >
                          <strong
                            style={{ color: "#28a745", fontSize: "14px" }}
                          >
                            FAMILY
                          </strong>
                          <p
                            style={{
                              margin: "8px 0 0 0",
                              fontSize: "18px",
                              fontWeight: "600",
                            }}
                          >
                            {reptile.reptile_category?.family}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Physical Characteristics */}
                  <div className="mb-5">
                    <h4
                      style={{
                        color: "#2c3e50",
                        fontWeight: "600",
                        marginBottom: "25px",
                        borderBottom: "3px solid #17a2b8",
                        paddingBottom: "10px",
                      }}
                    >
                      <i className="fas fa-ruler me-2"></i>
                      Đặc điểm vật lý
                    </h4>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <div
                          className="info-item"
                          style={{
                            padding: "15px",
                            backgroundColor: "#f8f9fa",
                            borderRadius: "10px",
                          }}
                        >
                          <strong style={{ color: "#17a2b8" }}>
                            <i className="fas fa-hourglass-half me-2"></i>
                            Tuổi thọ:
                          </strong>
                          <span style={{ marginLeft: "10px" }}>
                            {reptile.lifespan_years
                              ? `${reptile.lifespan_years} năm`
                              : "Không rõ"}
                          </span>
                        </div>
                      </div>
                      <div className="col-md-6 mb-3">
                        <div
                          className="info-item"
                          style={{
                            padding: "15px",
                            backgroundColor: "#f8f9fa",
                            borderRadius: "10px",
                          }}
                        >
                          <strong style={{ color: "#17a2b8" }}>
                            <i className="fas fa-expand-arrows-alt me-2"></i>
                            Kích thước trưởng thành:
                          </strong>
                          <span style={{ marginLeft: "10px" }}>
                            {reptile.adult_size
                              ? `${reptile.adult_size.min} - ${reptile.adult_size.max} cm`
                              : "Không rõ"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Habitat & Environment */}
                  <div className="mb-5">
                    <h4
                      style={{
                        color: "#2c3e50",
                        fontWeight: "600",
                        marginBottom: "25px",
                        borderBottom: "3px solid #ffc107",
                        paddingBottom: "10px",
                      }}
                    >
                      <i className="fas fa-globe me-2"></i>
                      Môi trường sống
                    </h4>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <div
                          className="info-item"
                          style={{
                            padding: "15px",
                            backgroundColor: "#fff8e1",
                            borderRadius: "10px",
                            border: "1px solid #ffc107",
                          }}
                        >
                          <strong style={{ color: "#f57c00" }}>
                            <i className="fas fa-tree me-2"></i>
                            Nhà ở tự nhiên:
                          </strong>
                          <p style={{ margin: "8px 0 0 0" }}>
                            {reptile.natural_habitat || "Không rõ"}
                          </p>
                        </div>
                      </div>
                      <div className="col-md-6 mb-3">
                        <div
                          className="info-item"
                          style={{
                            padding: "15px",
                            backgroundColor: "#fff8e1",
                            borderRadius: "10px",
                            border: "1px solid #ffc107",
                          }}
                        >
                          <strong style={{ color: "#f57c00" }}>
                            <i className="fas fa-clock me-2"></i>
                            Hoạt động:
                          </strong>
                          <p style={{ margin: "8px 0 0 0" }}>
                            {reptile.activity_pattern || "Không rõ"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-4 mb-3">
                        <div
                          className="text-center"
                          style={{
                            padding: "20px",
                            backgroundColor: "#ffebee",
                            borderRadius: "15px",
                            border: "2px solid #f44336",
                          }}
                        >
                          <i
                            className="fas fa-thermometer-half"
                            style={{
                              fontSize: "2rem",
                              color: "#f44336",
                              marginBottom: "10px",
                            }}
                          ></i>
                          <h6 style={{ color: "#f44336", fontWeight: "600" }}>
                            Nhiệt độ (ngày)
                          </h6>
                          <p
                            style={{
                              margin: 0,
                              fontSize: "18px",
                              fontWeight: "600",
                            }}
                          >
                            {reptile.temperature_range?.day?.join(" - ") ||
                              "Không rõ"}{" "}
                            °C
                          </p>
                        </div>
                      </div>
                      <div className="col-md-4 mb-3">
                        <div
                          className="text-center"
                          style={{
                            padding: "20px",
                            backgroundColor: "#e3f2fd",
                            borderRadius: "15px",
                            border: "2px solid #2196f3",
                          }}
                        >
                          <i
                            className="fas fa-moon"
                            style={{
                              fontSize: "2rem",
                              color: "#2196f3",
                              marginBottom: "10px",
                            }}
                          ></i>
                          <h6 style={{ color: "#2196f3", fontWeight: "600" }}>
                            Nhiệt độ (đêm)
                          </h6>
                          <p
                            style={{
                              margin: 0,
                              fontSize: "18px",
                              fontWeight: "600",
                            }}
                          >
                            {reptile.temperature_range?.night?.join(" - ") ||
                              "Không rõ"}{" "}
                            °C
                          </p>
                        </div>
                      </div>
                      <div className="col-md-4 mb-3">
                        <div
                          className="text-center"
                          style={{
                            padding: "20px",
                            backgroundColor: "#e8f5e8",
                            borderRadius: "15px",
                            border: "2px solid #4caf50",
                          }}
                        >
                          <i
                            className="fas fa-tint"
                            style={{
                              fontSize: "2rem",
                              color: "#4caf50",
                              marginBottom: "10px",
                            }}
                          ></i>
                          <h6 style={{ color: "#4caf50", fontWeight: "600" }}>
                            Độ ẩm
                          </h6>
                          <p
                            style={{
                              margin: 0,
                              fontSize: "18px",
                              fontWeight: "600",
                            }}
                          >
                            {reptile.humidity_range_percent?.join(" - ") ||
                              "Không rõ"}
                            %
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="text-center mt-3">
                      <div
                        style={{
                          display: "inline-block",
                          padding: "15px 30px",
                          backgroundColor: reptile.uvb_required
                            ? "#d4edda"
                            : "#f8d7da",
                          border: `2px solid ${
                            reptile.uvb_required ? "#28a745" : "#dc3545"
                          }`,
                          borderRadius: "25px",
                        }}
                      >
                        <strong
                          style={{
                            color: reptile.uvb_required ? "#28a745" : "#dc3545",
                          }}
                        >
                          <i
                            className={`fas ${
                              reptile.uvb_required ? "fa-sun" : "fa-times"
                            } me-2`}
                          ></i>
                          UVB:{" "}
                          {reptile.uvb_required ? "Cần thiết" : "Không cần"}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Diet */}
                  <div className="mb-5">
                    <h4
                      style={{
                        color: "#2c3e50",
                        fontWeight: "600",
                        marginBottom: "25px",
                        borderBottom: "3px solid #e91e63",
                        paddingBottom: "10px",
                      }}
                    >
                      <i className="fas fa-utensils me-2"></i>
                      Chế độ ăn
                    </h4>
                    <div className="row">
                      <div className="col-md-4 mb-3">
                        <div
                          style={{
                            padding: "20px",
                            backgroundColor: "#fce4ec",
                            borderRadius: "15px",
                            border: "2px solid #e91e63",
                            textAlign: "center",
                          }}
                        >
                          <i
                            className="fas fa-leaf"
                            style={{
                              fontSize: "2rem",
                              color: "#e91e63",
                              marginBottom: "10px",
                            }}
                          ></i>
                          <h6 style={{ color: "#e91e63", fontWeight: "600" }}>
                            Chế độ ăn
                          </h6>
                          <p style={{ margin: 0, fontSize: "16px" }}>
                            {reptile.diet || "Không rõ"}
                          </p>
                        </div>
                      </div>
                      <div className="col-md-4 mb-3">
                        <div
                          style={{
                            padding: "20px",
                            backgroundColor: "#e8f5e8",
                            borderRadius: "15px",
                            border: "2px solid #4caf50",
                          }}
                        >
                          <h6
                            style={{
                              color: "#4caf50",
                              fontWeight: "600",
                              marginBottom: "15px",
                            }}
                          >
                            <i className="fas fa-check me-2"></i>
                            Thức ăn khuyến nghị
                          </h6>
                          <p
                            style={{
                              margin: 0,
                              fontSize: "14px",
                              lineHeight: "1.6",
                            }}
                          >
                            {reptile.recommended_foods?.join(", ") ||
                              "Không rõ"}
                          </p>
                        </div>
                      </div>
                      <div className="col-md-4 mb-3">
                        <div
                          style={{
                            padding: "20px",
                            backgroundColor: "#ffebee",
                            borderRadius: "15px",
                            border: "2px solid #f44336",
                          }}
                        >
                          <h6
                            style={{
                              color: "#f44336",
                              fontWeight: "600",
                              marginBottom: "15px",
                            }}
                          >
                            <i className="fas fa-times me-2"></i>
                            Thức ăn cấm
                          </h6>
                          <p
                            style={{
                              margin: 0,
                              fontSize: "14px",
                              lineHeight: "1.6",
                            }}
                          >
                            {reptile.prohibited_foods?.join(", ") || "Không rõ"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Health */}
                  <div className="mb-5">
                    <h4
                      style={{
                        color: "#2c3e50",
                        fontWeight: "600",
                        marginBottom: "25px",
                        borderBottom: "3px solid #9c27b0",
                        paddingBottom: "10px",
                      }}
                    >
                      <i className="fas fa-heartbeat me-2"></i>
                      Sức khỏe
                    </h4>
                    <div className="row">
                      <div className="col-md-4 mb-3">
                        <div
                          style={{
                            padding: "20px",
                            backgroundColor: "#f3e5f5",
                            borderRadius: "15px",
                            border: "2px solid #9c27b0",
                          }}
                        >
                          <h6
                            style={{
                              color: "#9c27b0",
                              fontWeight: "600",
                              marginBottom: "15px",
                            }}
                          >
                            <i className="fas fa-virus me-2"></i>
                            Bệnh thường gặp
                          </h6>
                          <p
                            style={{
                              margin: 0,
                              fontSize: "14px",
                              lineHeight: "1.6",
                            }}
                          >
                            {reptile.disease?.day || "Không rõ"}
                          </p>
                        </div>
                      </div>
                      <div className="col-md-4 mb-3">
                        <div
                          style={{
                            padding: "20px",
                            backgroundColor: "#e8f5e8",
                            borderRadius: "15px",
                            border: "2px solid #4caf50",
                          }}
                        >
                          <h6
                            style={{
                              color: "#4caf50",
                              fontWeight: "600",
                              marginBottom: "15px",
                            }}
                          >
                            <i className="fas fa-shield-alt me-2"></i>
                            Phòng bệnh
                          </h6>
                          <p
                            style={{
                              margin: 0,
                              fontSize: "14px",
                              lineHeight: "1.6",
                            }}
                          >
                            {reptile.disease?.prevention || "Không rõ"}
                          </p>
                        </div>
                      </div>
                      <div className="col-md-4 mb-3">
                        <div
                          style={{
                            padding: "20px",
                            backgroundColor: "#fff3e0",
                            borderRadius: "15px",
                            border: "2px solid #ff9800",
                          }}
                        >
                          <h6
                            style={{
                              color: "#ff9800",
                              fontWeight: "600",
                              marginBottom: "15px",
                            }}
                          >
                            <i className="fas fa-pills me-2"></i>
                            Điều trị
                          </h6>
                          <p
                            style={{
                              margin: 0,
                              fontSize: "14px",
                              lineHeight: "1.6",
                            }}
                          >
                            {reptile.disease?.treatment || "Không rõ"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-5">
                    <h4
                      style={{
                        color: "#2c3e50",
                        fontWeight: "600",
                        marginBottom: "25px",
                        borderBottom: "3px solid #607d8b",
                        paddingBottom: "10px",
                      }}
                    >
                      <i className="fas fa-info-circle me-2"></i>
                      Mô tả chi tiết
                    </h4>
                    <div
                      style={{
                        padding: "30px",
                        backgroundColor: "#f8f9fa",
                        borderRadius: "15px",
                        border: "1px solid #dee2e6",
                        fontSize: "16px",
                        lineHeight: "1.8",
                      }}
                    >
                      <p style={{ margin: 0 }}>
                        {reptile.reptile_description || "Không có mô tả."}
                      </p>
                    </div>
                  </div>

                  {/* Timestamps */}
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <div
                        style={{
                          padding: "20px",
                          backgroundColor: "#e3f2fd",
                          borderRadius: "15px",
                          border: "1px solid #2196f3",
                          textAlign: "center",
                        }}
                      >
                        <i
                          className="fas fa-calendar-plus"
                          style={{
                            fontSize: "1.5rem",
                            color: "#2196f3",
                            marginBottom: "10px",
                          }}
                        ></i>
                        <h6 style={{ color: "#2196f3", fontWeight: "600" }}>
                          Ngày tạo
                        </h6>
                        <p style={{ margin: 0, fontSize: "14px" }}>
                          {new Date(reptile.createdAt).toLocaleString("vi-VN")}
                        </p>
                      </div>
                    </div>
                    <div className="col-md-6 mb-3">
                      <div
                        style={{
                          padding: "20px",
                          backgroundColor: "#fff3e0",
                          borderRadius: "15px",
                          border: "1px solid #ff9800",
                          textAlign: "center",
                        }}
                      >
                        <i
                          className="fas fa-calendar-check"
                          style={{
                            fontSize: "1.5rem",
                            color: "#ff9800",
                            marginBottom: "10px",
                          }}
                        ></i>
                        <h6 style={{ color: "#ff9800", fontWeight: "600" }}>
                          Cập nhật lần cuối
                        </h6>
                        <p style={{ margin: 0, fontSize: "14px" }}>
                          {new Date(reptile.updatedAt).toLocaleString("vi-VN")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Back Button */}
          <div className="text-center mt-4">
            <Link
              to="/LibraryExpert"
              className="btn btn-success"
              style={{
                borderRadius: "25px",
                padding: "15px 40px",
                fontSize: "16px",
                fontWeight: "600",
                border: "none",
                boxShadow: "0 4px 15px rgba(40, 167, 69, 0.3)",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 6px 20px rgba(40, 167, 69, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 15px rgba(40, 167, 69, 0.3)";
              }}
            >
              <i className="fas fa-arrow-left me-2"></i>
              Quay lại danh sách
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default LibraryExpertDetail;
