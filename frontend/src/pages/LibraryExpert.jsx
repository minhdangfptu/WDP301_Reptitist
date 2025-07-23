import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { baseUrl } from "../config";
import { useAuth } from "../context/AuthContext";

const LibraryExpert = () => {
  const [reptiles, setReptiles] = useState([]);
  const [filteredReptiles, setFilteredReptiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("name"); // Default sort by name
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { hasRole, user } = useAuth();
  useEffect(() => {
    setLoading(true);
    axios
      .get(`${baseUrl}/reptitist/info/get-all-reptile`)
      .then((response) => {
        setReptiles(response.data.data);
        setFilteredReptiles(response.data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Handle search
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = reptiles.filter((reptile) =>
      reptile.common_name.toLowerCase().includes(term)
    );
    setFilteredReptiles(filtered);
  };

  // Handle sort
  const handleSort = (e) => {
    const option = e.target.value;
    setSortOption(option);
    const sorted = [...filteredReptiles].sort((a, b) => {
      if (option === "name") {
        return a.common_name.localeCompare(b.common_name);
      } else if (option === "date") {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
      return 0;
    });
    setFilteredReptiles(sorted);
  };

  const handleCardClick = (id) => {
    navigate(`/LibraryExpertDetail/${id}`);
  }
  if (loading) {
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img
          src="/loading.gif"
          alt="Loading"
          style={{ width: 50, height: 50, marginRight: 12 }}
        />
        Đang tải danh sách bò sát...
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="page-title" style={{ marginBottom: "5px" }}>
        <div className="container">
          <h1>THƯ VIỆN CHUYÊN SÂU</h1>
        </div>
      </div>
      <div className="container">
        <div className="breadcrumb" style={{ marginBottom: "0px" }}>
          <Link to="/">Trang chủ</Link> <i className="fas fa-angle-right"></i>{" "}
          <Link to="/LibraryTopic">Thư viện kiến thức</Link>{" "}
          <i className="fas fa-angle-right"></i>{" "}
          <span>Thư viện chuyên sâu</span>
        </div>
      </div>
      <div className="container" style={{ padding: "15px" }}>
        {/* Hiển thị nút "Tạo mới bài viết" nếu user có role "admin" */}

        {/* Search and Sort Controls */}
        <div
          className="card mb-4"
          style={{
            border: "1px solid #dee2e6",
            borderRadius: "10px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
          }}
        >
          <div className="card-body">
            <div className="row align-items-center">
              <div className="col-md-8 mb-3 mb-md-0">
                <div style={{ position: "relative" }}>
                  <i
                    className="fas fa-search"
                    style={{
                      position: "absolute",
                      left: "15px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#6c757d",
                      zIndex: 2,
                    }}
                  ></i>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Tìm kiếm bò sát..."
                    value={searchTerm}
                    onChange={handleSearch}
                    style={{
                      paddingLeft: "45px",
                      border: "2px solid #e9ecef",
                      borderRadius: "25px",
                      fontSize: "16px",
                      transition: "all 0.3s ease",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#28a745";
                      e.target.style.boxShadow =
                        "0 0 0 0.2rem rgba(40, 167, 69, 0.25)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#e9ecef";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                </div>
              </div>
              <div className="col-md-4">
                <div className="d-flex align-items-center">
                  <i
                    className="fas fa-sort me-2"
                    style={{ color: "#6c757d" }}
                  ></i>
                  <select
                    className="form-select"
                    value={sortOption}
                    onChange={handleSort}
                    style={{
                      border: "2px solid #e9ecef",
                      borderRadius: "10px",
                      fontSize: "14px",
                    }}
                  >
                    <option value="name">Sắp xếp theo tên</option>
                    <option value="date">Sắp xếp theo ngày tạo</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p style={{ color: "#6c757d", margin: 0 }}>
            Hiển thị{" "}
            <strong style={{ color: "#2c3e50" }}>
              {filteredReptiles.length}
            </strong>{" "}
            kết quả
            {searchTerm && (
              <span>
                {" "}
                cho từ khóa "
                <strong style={{ color: "#28a745" }}>{searchTerm}</strong>"
              </span>
            )}
          </p>
          {hasRole("admin") && (
            <div
              style={{
                textAlign: "right",
                justifyContent: "center",
                alignItems: "center",
                marginTop: "10px",
              }}
            >
              <button
                className="btn btn-success"
                onClick={() => navigate("/library_expert/create")}
                style={{
                  fontSize: "16px",
                  borderRadius: "5px",
                }}
              >
                Tạo mới bài viết
              </button>
            </div>
          )}
        </div>

        {/* Reptiles Grid */}
        {filteredReptiles.length === 0 ? (
          <div className="text-center" style={{ padding: "60px 20px" }}>
            <i
              className="fas fa-search"
              style={{
                fontSize: "4rem",
                color: "#dee2e6",
              }}
            ></i>
            <h3 style={{ color: "#2c3e50", marginBottom: "10px" }}>
              Không tìm thấy kết quả
            </h3>
            <p style={{ color: "#6c757d" }}>
              Thử thay đổi từ khóa tìm kiếm của bạn
            </p>
          </div>
        ) : (
          <div className="row">
            {filteredReptiles.map((reptile) => (
              <div
                key={reptile._id}
                className="col-lg-2 col-md-3 col-sm-4 col-6 mb-4"
              >
                <div
                  className="card h-100"
                  style={{
                    border: "1px solid #dee2e6",
                    borderRadius: "15px",
                    overflow: "hidden",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
                  }}
                  onClick={() => handleCardClick(reptile._id)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-5px)";
                    e.currentTarget.style.boxShadow =
                      "0 8px 25px rgba(0,0,0,0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 2px 10px rgba(0,0,0,0.08)";
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      overflow: "hidden",
                      height: "150px",
                    }}
                  >
                    <img
                      src={
                        reptile.reptile_imageurl||
                        "https://cdn.pixabay.com/photo/2017/01/31/15/06/dinosaurs-2022584_960_720.png"
                      }
                      alt={reptile.common_name}
                      className="card-img-top"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        transition: "transform 0.3s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = "scale(1.1)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = "scale(1)";
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(0,0,0,0)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.3s ease",
                        opacity: 0,
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = "rgba(0,0,0,0.3)";
                        e.target.style.opacity = 1;
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = "rgba(0,0,0,0)";
                        e.target.style.opacity = 0;
                      }}
                    >
                      <span
                        style={{
                          color: "white",
                          fontSize: "14px",
                          fontWeight: "500",
                          textAlign: "center",
                        }}
                      >
                        Xem chi tiết
                      </span>
                    </div>
                  </div>
                  <div className="card-body" style={{ padding: "15px" }}>
                    <h6
                      className="card-title"
                      style={{
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#2c3e50",
                        margin: "0 0 8px 0",
                        lineHeight: "1.4",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {reptile.specific_name}
                    </h6>
                    <small className="text-muted" style={{ fontSize: "12px" }}>
                      {reptile.common_name}
                    </small>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default LibraryExpert;
