"use client";

import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { baseUrl } from "../config";
import { useAuth } from "../context/AuthContext";
import LibraryExpert from "./LibraryExpert";
import Footer from "../components/Footer";
import Header from "../components/Header";
import reptileApi from "../api/reptileApi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const LibraryExpertCreate = () => {
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  const [loading, setLoading] = useState(false);
  const [humidityMin, setHumidityMin] = useState("");
  const [humidityMax, setHumidityMax] = useState("");
  const [previewImage, setPreviewImage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    common_name: "",
    specific_name: "",
    breed_or_morph: "",
    reptile_category: {
      class: "",
      order: "",
      family: "",
    },
    lifespan_years: "",
    adult_size: {
      min: "",
      max: "",
    },
    natural_habitat: "",
    activity_pattern: "",
    temperature_range: {
      day: ["", ""],
      night: ["", ""],
    },
    humidity_range_percent: ["", ""],
    uvb_required: false,
    diet: "",
    recommended_foods: "",
    prohibited_foods: "",
    disease: {
      day: "",
      prevention: "",
      treatment: "",
    },
    reptile_description: "",
    reptile_imageurl: "",
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.includes(".")) {
      const [parent, child, index] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]:
            index !== undefined
              ? prev[parent][child].map((item, i) =>
                  i === Number.parseInt(index) ? value : item
                )
              : value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleArrayInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value, // Lưu giá trị thô (chuỗi) thay vì mảng
    }));
  };

  const handleArrayBlur = (field) => {
    setFormData((prev) => {
      const fieldValue = prev[field];

      // Ensure fieldValue is a string before calling split
      if (typeof fieldValue === "string") {
        return {
          ...prev,
          [field]: fieldValue
            .split(",")
            .map((item) => item.trim())
            .filter((item) => item !== ""),
        };
      }

      // If fieldValue is not a string, return prev unchanged
      console.error(`Expected a string for field '${field}', but got:`, fieldValue);
      return prev;
    });
  };

  let humidityRange = [];

  if (humidityMin !== "" && humidityMax !== "") {
    const min = Number(humidityMin);
    const max = Number(humidityMax);

    if (!isNaN(min) && !isNaN(max)) {
      humidityRange = [min, max];
    }
  }

  const handleSubmit = async (e) => {
    // e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("access_token");

      // Chuẩn bị dữ liệu để gửi
      const submitData = {
        ...formData,
        lifespan_years: formData.lifespan_years
          ? Number.parseInt(formData.lifespan_years)
          : null,
        adult_size: {
          min: formData.adult_size.min
            ? Number.parseInt(formData.adult_size.min)
            : null,
          max: formData.adult_size.max
            ? Number.parseInt(formData.adult_size.max)
            : null,
        },
        temperature_range: {
          day: Array.isArray(formData.temperature_range.day)
            ? formData.temperature_range.day
                .map((temp) => (temp ? Number.parseInt(temp) : null))
                .filter((temp) => temp !== null)
            : [],
          night: Array.isArray(formData.temperature_range.night)
            ? formData.temperature_range.night
                .map((temp) => (temp ? Number.parseInt(temp) : null))
                .filter((temp) => temp !== null)
            : [],
        },
        recommended_foods:
          typeof formData.recommended_foods === "string"
            ? formData.recommended_foods
                .split(",")
                .map((item) => item.trim())
                .filter((item) => item !== "")
            : formData.recommended_foods,
        prohibited_foods:
          typeof formData.prohibited_foods === "string"
            ? formData.prohibited_foods
                .split(",")
                .map((item) => item.trim())
                .filter((item) => item !== "")
            : formData.prohibited_foods,
        humidity_range_percent: humidityRange,
        user_id: user._id,
      };

      // Gọi API tạo mới bò sát
      await reptileApi.createReptile(submitData, token);
      toast.success("Reptile created successfully!", {
        onClose: () => navigate("/LibraryExpert"),
      });
    } catch (error) {
      console.error("Lỗi khi tạo bò sát:", error);
      toast.error("Có lỗi xảy ra khi tạo bò sát. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  // Check if user has admin role
  if (!hasRole("admin")) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
        <div
          className="container"
          style={{ padding: "100px 15px", textAlign: "center" }}
        >
          <i
            className="fas fa-lock"
            style={{ fontSize: "4rem", color: "#dc3545", marginBottom: "20px" }}
          ></i>
          <h3 style={{ color: "#2c3e50", marginBottom: "10px" }}>
            Không có quyền truy cập
          </h3>
          <p style={{ color: "#6c757d" }}>
            Bạn cần quyền admin để tạo bò sát mới.
          </p>
          <Link to="/LibraryExpert" className="btn btn-success">
            Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  // Helper function to convert file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Validate image file
  const validateImageFile = (file) => {
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: "Please select a valid image file (JPEG, PNG, GIF, WebP)",
      };
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return { isValid: false, error: "Image size must not exceed 5MB" };
    }

    return { isValid: true };
  };

  // Handle image upload
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.isValid) {
      toast.error(validation.error);
      return;
    }

    setIsUploading(true);

    try {
      const base64Data = await fileToBase64(file);
      setFormData((prev) => ({ ...prev, reptile_imageurl: base64Data }));
      setPreviewImage(base64Data);
      toast.success("Image uploaded successfully!");
    } catch (error) {
      console.error("Image upload error:", error);
      toast.error("Error uploading image. Please try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
      />
      <Header />
      <div style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
        {/* Hero Header */}
        <div
          style={{
            background: "linear-gradient(135deg, #28a745 0%, #20c997 100%)",
            color: "white",
            padding: "20px 0",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                'url(\'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="1" fill="%23ffffff" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>\')',
              opacity: 0.3,
            }}
          ></div>
          <div
            className="container"
            style={{ position: "relative", zIndex: 2 }}
          >
            <h1
              style={{
                fontSize: "2.5rem",
                fontWeight: "bold",
                margin: 0,
                textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
                letterSpacing: "1px",
              }}
            >
              TẠO BÒ SÁT MỚI
            </h1>
            <p
              style={{
                fontSize: "1.1rem",
                margin: "10px 0 0 0",
                opacity: 0.9,
              }}
            >
              Thêm thông tin chi tiết về loài bò sát mới
            </p>
          </div>
        </div>

        {/* Breadcrumb */}
        <div
          style={{
            backgroundColor: "white",
            borderBottom: "1px solid #dee2e6",
            padding: "15px 0",
          }}
        >
          <div className="container">
            <nav aria-label="breadcrumb">
              <ol
                className="breadcrumb"
                style={{ margin: 0, backgroundColor: "transparent" }}
              >
                <li className="breadcrumb-item">
                  <Link
                    to="/"
                    style={{ color: "#28a745", textDecoration: "none" }}
                  >
                    <i className="fas fa-home me-1"></i>
                    Trang chủ
                  </Link>
                </li>
                <li className="breadcrumb-item">
                  <Link
                    to="/LibraryExpert"
                    style={{ color: "#28a745", textDecoration: "none" }}
                  >
                    Thư viện chuyên sâu
                  </Link>
                </li>
                <li className="breadcrumb-item active" aria-current="page">
                  Tạo mới
                </li>
              </ol>
            </nav>
          </div>
        </div>

        {/* Main Form */}
        <div className="container" style={{ padding: "40px 15px" }}>
          <form onSubmit={handleSubmit}>
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
                    {/* Basic Information */}
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
                        <i className="fas fa-info-circle me-2"></i>
                        Thông tin cơ bản
                      </h4>
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label
                            className="form-label"
                            style={{ fontWeight: "600", color: "#2c3e50" }}
                          >
                            <i className="fas fa-tag me-2"></i>
                            Tên thông thường *
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            name="common_name"
                            value={formData.common_name}
                            onChange={handleInputChange}
                            required
                            style={{
                              border: "2px solid #e9ecef",
                              borderRadius: "10px",
                              padding: "12px 15px",
                              fontSize: "16px",
                            }}
                            placeholder="Ví dụ: Burmese Python"
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label
                            className="form-label"
                            style={{ fontWeight: "600", color: "#2c3e50" }}
                          >
                            <i className="fas fa-dna me-2"></i>
                            Tên khoa học
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            name="specific_name"
                            value={formData.specific_name}
                            onChange={handleInputChange}
                            style={{
                              border: "2px solid #e9ecef",
                              borderRadius: "10px",
                              padding: "12px 15px",
                              fontSize: "16px",
                            }}
                            placeholder="Ví dụ: Python bivittatus"
                          />
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label
                            className="form-label"
                            style={{ fontWeight: "600", color: "#2c3e50" }}
                          >
                            <i className="fas fa-palette me-2"></i>
                            Biến thể/Giống
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            name="breed_or_morph"
                            value={formData.breed_or_morph}
                            onChange={handleInputChange}
                            style={{
                              border: "2px solid #e9ecef",
                              borderRadius: "10px",
                              padding: "12px 15px",
                              fontSize: "16px",
                            }}
                            placeholder="Ví dụ: Albino"
                          />
                        </div>
                        {/* <div className="col-md-6 mb-3">
                          <label
                            className="form-label"
                            style={{ fontWeight: "600", color: "#2c3e50" }}
                          >
                            <i className="fas fa-image me-2"></i>
                            URL hình ảnh
                          </label>
                          <input
                            type="url"
                            className="form-control"
                            name="reptile_imageurl"
                            value={formData.reptile_imageurl}
                            onChange={handleInputChange}
                            style={{
                              border: "2px solid #e9ecef",
                              borderRadius: "10px",
                              padding: "12px 15px",
                              fontSize: "16px",
                            }}
                            placeholder="https://example.com/image.jpg"
                          />
                        </div> */}
                      </div>
                    </div>

                    {/* Classification */}
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
                        <i className="fas fa-sitemap me-2"></i>
                        Phân loại
                      </h4>
                      <div className="row">
                        <div className="col-md-4 mb-3">
                          <label
                            className="form-label"
                            style={{ fontWeight: "600", color: "#17a2b8" }}
                          >
                            Class *
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            name="reptile_category.class"
                            value={formData.reptile_category.class}
                            onChange={handleInputChange}
                            required
                            style={{
                              border: "2px solid #17a2b8",
                              borderRadius: "10px",
                              padding: "12px 15px",
                              fontSize: "16px",
                            }}
                            placeholder="Ví dụ: Reptilia"
                          />
                        </div>
                        <div className="col-md-4 mb-3">
                          <label
                            className="form-label"
                            style={{ fontWeight: "600", color: "#17a2b8" }}
                          >
                            Order *
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            name="reptile_category.order"
                            value={formData.reptile_category.order}
                            onChange={handleInputChange}
                            required
                            style={{
                              border: "2px solid #17a2b8",
                              borderRadius: "10px",
                              padding: "12px 15px",
                              fontSize: "16px",
                            }}
                            placeholder="Ví dụ: Squamata"
                          />
                        </div>
                        <div className="col-md-4 mb-3">
                          <label
                            className="form-label"
                            style={{ fontWeight: "600", color: "#17a2b8" }}
                          >
                            Family *
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            name="reptile_category.family"
                            value={formData.reptile_category.family}
                            onChange={handleInputChange}
                            required
                            style={{
                              border: "2px solid #17a2b8",
                              borderRadius: "10px",
                              padding: "12px 15px",
                              fontSize: "16px",
                            }}
                            placeholder="Ví dụ: Pythonidae"
                          />
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
                          borderBottom: "3px solid #ffc107",
                          paddingBottom: "10px",
                        }}
                      >
                        <i className="fas fa-ruler me-2"></i>
                        Đặc điểm vật lý
                      </h4>
                      <div className="row">
                        <div className="col-md-4 mb-3">
                          <label
                            className="form-label"
                            style={{ fontWeight: "600", color: "#f57c00" }}
                          >
                            <i className="fas fa-hourglass-half me-2"></i>
                            Tuổi thọ (năm)
                          </label>
                          <input
                            type="number"
                            className="form-control"
                            name="lifespan_years"
                            value={formData.lifespan_years}
                            onChange={handleInputChange}
                            min="1"
                            style={{
                              border: "2px solid #ffc107",
                              borderRadius: "10px",
                              padding: "12px 15px",
                              fontSize: "16px",
                            }}
                            placeholder="Ví dụ: 20"
                          />
                        </div>
                        <div className="col-md-4 mb-3">
                          <label
                            className="form-label"
                            style={{ fontWeight: "600", color: "#f57c00" }}
                          >
                            <i className="fas fa-expand-arrows-alt me-2"></i>
                            Kích thước min (cm)
                          </label>
                          <input
                            type="number"
                            className="form-control"
                            name="adult_size.min"
                            value={formData.adult_size.min}
                            onChange={handleInputChange}
                            min="1"
                            style={{
                              border: "2px solid #ffc107",
                              borderRadius: "10px",
                              padding: "12px 15px",
                              fontSize: "16px",
                            }}
                            placeholder="Ví dụ: 300"
                          />
                        </div>
                        <div className="col-md-4 mb-3">
                          <label
                            className="form-label"
                            style={{ fontWeight: "600", color: "#f57c00" }}
                          >
                            <i className="fas fa-expand-arrows-alt me-2"></i>
                            Kích thước max (cm)
                          </label>
                          <input
                            type="number"
                            className="form-control"
                            name="adult_size.max"
                            value={formData.adult_size.max}
                            onChange={handleInputChange}
                            min="1"
                            style={{
                              border: "2px solid #ffc107",
                              borderRadius: "10px",
                              padding: "12px 15px",
                              fontSize: "16px",
                            }}
                            placeholder="Ví dụ: 500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Environment */}
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
                        <i className="fas fa-globe me-2"></i>
                        Môi trường sống
                      </h4>
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label
                            className="form-label"
                            style={{ fontWeight: "600", color: "#e91e63" }}
                          >
                            <i className="fas fa-tree me-2"></i>
                            Nhà ở tự nhiên
                          </label>
                          <textarea
                            className="form-control"
                            name="natural_habitat"
                            value={formData.natural_habitat}
                            onChange={handleInputChange}
                            rows="3"
                            style={{
                              border: "2px solid #e91e63",
                              borderRadius: "10px",
                              padding: "12px 15px",
                              fontSize: "16px",
                            }}
                            placeholder="Mô tả môi trường sống tự nhiên..."
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label
                            className="form-label"
                            style={{ fontWeight: "600", color: "#e91e63" }}
                          >
                            <i className="fas fa-clock me-2"></i>
                            Hoạt động
                          </label>
                          <select
                            className="form-select"
                            name="activity_pattern"
                            value={formData.activity_pattern}
                            onChange={handleInputChange}
                            style={{
                              border: "2px solid #e91e63",
                              borderRadius: "10px",
                              padding: "12px 15px",
                              fontSize: "16px",
                            }}
                          >
                            <option value="">Chọn thời gian hoạt động</option>
                            <option value="Hoạt động ban ngày (Diurnal)">
                              Hoạt động ban ngày (Diurnal)
                            </option>
                            <option value="Hoạt động ban đêm (Nocturnal)">
                              Hoạt động ban đêm (Nocturnal)
                            </option>
                            <option value="Hoạt động lúc chạng vạng (Crepuscular)">
                              Hoạt động lúc chạng vạng (Crepuscular)
                            </option>
                            <option value="Hoạt động lúc chạng vạng (Crepuscular)">
                              Hoạt động cả ngày lẫn đêm (Cathemeral)
                            </option>
                          </select>
                        </div>
                      </div>

                      {/* Temperature and Humidity */}
                      <div className="row">
                        <div className="col-md-3 mb-3">
                          <label
                            className="form-label"
                            style={{ fontWeight: "600", color: "#f44336" }}
                          >
                            <i className="fas fa-thermometer-half me-2"></i>
                            Nhiệt độ ngày min (°C)
                          </label>
                          <input
                            type="number"
                            className="form-control"
                            name="temperature_range.day.0"
                            value={formData.temperature_range.day[0]}
                            onChange={handleInputChange}
                            style={{
                              border: "2px solid #f44336",
                              borderRadius: "10px",
                              padding: "12px 15px",
                              fontSize: "16px",
                            }}
                            placeholder="25"
                          />
                        </div>
                        <div className="col-md-3 mb-3">
                          <label
                            className="form-label"
                            style={{ fontWeight: "600", color: "#f44336" }}
                          >
                            <i className="fas fa-thermometer-half me-2"></i>
                            Nhiệt độ ngày max (°C)
                          </label>
                          <input
                            type="number"
                            className="form-control"
                            name="temperature_range.day.1"
                            value={formData.temperature_range.day[1]}
                            onChange={handleInputChange}
                            style={{
                              border: "2px solid #f44336",
                              borderRadius: "10px",
                              padding: "12px 15px",
                              fontSize: "16px",
                            }}
                            placeholder="32"
                          />
                        </div>
                        <div className="col-md-3 mb-3">
                          <label
                            className="form-label"
                            style={{ fontWeight: "600", color: "#2196f3" }}
                          >
                            <i className="fas fa-moon me-2"></i>
                            Nhiệt độ đêm min (°C)
                          </label>
                          <input
                            type="number"
                            className="form-control"
                            name="temperature_range.night.0"
                            value={formData.temperature_range.night[0]}
                            onChange={handleInputChange}
                            style={{
                              border: "2px solid #2196f3",
                              borderRadius: "10px",
                              padding: "12px 15px",
                              fontSize: "16px",
                            }}
                            placeholder="20"
                          />
                        </div>
                        <div className="col-md-3 mb-3">
                          <label
                            className="form-label"
                            style={{ fontWeight: "600", color: "#2196f3" }}
                          >
                            <i className="fas fa-moon me-2"></i>
                            Nhiệt độ đêm max (°C)
                          </label>
                          <input
                            type="number"
                            className="form-control"
                            name="temperature_range.night.1"
                            value={formData.temperature_range.night[1]}
                            onChange={handleInputChange}
                            style={{
                              border: "2px solid #2196f3",
                              borderRadius: "10px",
                              padding: "12px 15px",
                              fontSize: "16px",
                            }}
                            placeholder="25"
                          />
                        </div>
                      </div>

                      <div className="row">
                        <div className="row mb-2">
                          <label
                            className="form-label"
                            style={{ fontWeight: "600", color: "#4caf50" }}
                          >
                            <i className="fas fa-tint"></i> Độ ẩm (%)
                          </label>
                          <div className="col-sm-6">
                            <input
                              style={{
                                border: "2px solid #4caf50",
                                borderRadius: "10px",
                                padding: "12px 15px",
                                fontSize: "16px",
                              }}
                              type="number"
                              className="form-control"
                              placeholder="Tối thiểu"
                              value={humidityMin}
                              onChange={(e) => setHumidityMin(e.target.value)}
                            />
                          </div>
                          <div className="col-sm-6">
                            <input
                              style={{
                                border: "2px solid #4caf50",
                                borderRadius: "10px",
                                padding: "12px 15px",
                                fontSize: "16px",
                              }}
                              type="number"
                              className="form-control"
                              placeholder="Tối đa"
                              value={humidityMax}
                              onChange={(e) => setHumidityMax(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="col-md-6 mb-3">
                          <label
                            className="form-label"
                            style={{ fontWeight: "600", color: "#ff9800" }}
                          >
                            <i className="fas fa-sun me-2"></i>
                            Yêu cầu UVB
                          </label>
                          <div
                            style={{
                              border: "2px solid #ff9800",
                              borderRadius: "10px",
                              padding: "12px 15px",
                              backgroundColor: "#fff3e0",
                            }}
                          >
                            <div className="form-check">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                name="uvb_required"
                                checked={formData.uvb_required}
                                onChange={handleInputChange}
                                style={{ transform: "scale(1.2)" }}
                              />
                              <label
                                className="form-check-label"
                                style={{
                                  marginLeft: "10px",
                                  fontWeight: "500",
                                }}
                              >
                                Cần ánh sáng UVB
                              </label>
                            </div>
                          </div>
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
                          borderBottom: "3px solid #9c27b0",
                          paddingBottom: "10px",
                        }}
                      >
                        <i className="fas fa-utensils me-2"></i>
                        Chế độ ăn
                      </h4>
                      <div className="row">
                        <div className="col-md-4 mb-3">
                          <label
                            className="form-label"
                            style={{ fontWeight: "600", color: "#9c27b0" }}
                          >
                            <i className="fas fa-leaf me-2"></i>
                            Loại chế độ ăn
                          </label>
                          <select
                            className="form-select"
                            name="diet"
                            value={formData.diet}
                            onChange={handleInputChange}
                            style={{
                              border: "2px solid #9c27b0",
                              borderRadius: "10px",
                              padding: "12px 15px",
                              fontSize: "16px",
                            }}
                          >
                            <option value="">Chọn chế độ ăn</option>
                            <option value="Carnivore (Ăn thịt)">
                              Ăn thịt (Carnivore)
                            </option>
                            <option value="Herbivore (Ăn cỏ)">Ăn cỏ (Herbivore)</option>
                            <option value="Omnivore (Ăn tạp)">Ăn tạp (Omnivore)</option>
                            <option value="Insectivore (Ăn côn trùng)">
                              Ăn côn trùng (Insectivore)
                            </option>
                          </select>
                        </div>
                        <div className="col-md-4 mb-3">
                          <label
                            className="form-label"
                            style={{ fontWeight: "600", color: "#4caf50" }}
                          >
                            <i className="fas fa-check me-2"></i>
                            Thức ăn khuyến nghị
                          </label>
                          <textarea
                            className="form-control"
                            name="recommended_foods"
                            value={formData.recommended_foods}
                            onChange={(e) =>
                              handleArrayInputChange(
                                "recommended_foods",
                                e.target.value
                              )
                            }
                            onBlur={() => handleArrayBlur("recommended_foods")} // Xử lý khi rời khỏi trường nhập liệu
                            rows="3"
                            style={{
                              border: "2px solid #4caf50",
                              borderRadius: "10px",
                              padding: "12px 15px",
                              fontSize: "16px",
                            }}
                            placeholder="Chuột, thỏ, gà (phân cách bằng dấu phẩy)"
                          />
                        </div>
                        <div className="col-md-4 mb-3">
                          <label
                            className="form-label"
                            style={{ fontWeight: "600", color: "#f44336" }}
                          >
                            <i className="fas fa-times me-2"></i>
                            Thức ăn cấm
                          </label>
                          <textarea
                            onBlur={() => handleArrayBlur("recommended_foods")} // Xử lý khi rời khỏi trường nhập liệu
                            className="form-control"
                            name="prohibited_foods"
                            value={formData.prohibited_foods}
                            onChange={(e) =>
                              handleArrayInputChange(
                                "prohibited_foods",
                                e.target.value
                              )
                            }
                            rows="3"
                            style={{
                              border: "2px solid #f44336",
                              borderRadius: "10px",
                              padding: "12px 15px",
                              fontSize: "16px",
                            }}
                            placeholder="Thức ăn độc hại (phân cách bằng dấu phẩy)"
                          />
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
                          borderBottom: "3px solid #607d8b",
                          paddingBottom: "10px",
                        }}
                      >
                        <i className="fas fa-heartbeat me-2"></i>
                        Sức khỏe
                      </h4>
                      <div className="row">
                        <div className="col-md-4 mb-3">
                          <label
                            className="form-label"
                            style={{ fontWeight: "600", color: "#607d8b" }}
                          >
                            <i className="fas fa-virus me-2"></i>
                            Bệnh thường gặp
                          </label>
                          <textarea
                            className="form-control"
                            name="disease.day"
                            value={formData.disease.day}
                            onChange={handleInputChange}
                            rows="3"
                            style={{
                              border: "2px solid #607d8b",
                              borderRadius: "10px",
                              padding: "12px 15px",
                              fontSize: "16px",
                            }}
                            placeholder="Mô tả các bệnh thường gặp..."
                          />
                        </div>
                        <div className="col-md-4 mb-3">
                          <label
                            className="form-label"
                            style={{ fontWeight: "600", color: "#4caf50" }}
                          >
                            <i className="fas fa-shield-alt me-2"></i>
                            Cách phòng bệnh
                          </label>
                          <textarea
                            className="form-control"
                            name="disease.prevention"
                            value={formData.disease.prevention}
                            onChange={handleInputChange}
                            rows="3"
                            style={{
                              border: "2px solid #4caf50",
                              borderRadius: "10px",
                              padding: "12px 15px",
                              fontSize: "16px",
                            }}
                            placeholder="Cách phòng ngừa bệnh..."
                          />
                        </div>
                        <div className="col-md-4 mb-3">
                          <label
                            className="form-label"
                            style={{ fontWeight: "600", color: "#ff9800" }}
                          >
                            <i className="fas fa-pills me-2"></i>
                            Cách điều trị
                          </label>
                          <textarea
                            className="form-control"
                            name="disease.treatment"
                            value={formData.disease.treatment}
                            onChange={handleInputChange}
                            rows="3"
                            style={{
                              border: "2px solid #ff9800",
                              borderRadius: "10px",
                              padding: "12px 15px",
                              fontSize: "16px",
                            }}
                            placeholder="Cách điều trị bệnh..."
                          />
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
                          borderBottom: "3px solid #795548",
                          paddingBottom: "10px",
                        }}
                      >
                        <i className="fas fa-file-alt me-2"></i>
                        Mô tả chi tiết
                      </h4>
                      <textarea
                        className="form-control"
                        name="reptile_description"
                        value={formData.reptile_description}
                        onChange={handleInputChange}
                        rows="5"
                        style={{
                          border: "2px solid #795548",
                          borderRadius: "10px",
                          padding: "15px",
                          fontSize: "16px",
                          lineHeight: "1.6",
                        }}
                        placeholder="Mô tả chi tiết về loài bò sát này..."
                      />
                    </div>

                    <div className="mb-5">
                      <h4
                        style={{
                          color: "#2c3e50",
                          fontWeight: "600",
                          marginBottom: "25px",
                          borderBottom: "3px solid #2196f3",
                          paddingBottom: "10px",
                          display: "flex",
                          alignItems: "center",
                          fontSize: "20px",
                        }}
                      >
                        <i
                          className="fas fa-image me-2"
                          style={{ color: "#2196f3", fontSize: "20px" }}
                        ></i>
                        Tải lên hình ảnh
                      </h4>

                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label
                            className="form-label"
                            style={{
                              fontWeight: "600",
                              color: "#2196f3",
                              marginBottom: "10px",
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <i
                              className="fas fa-upload me-2"
                              style={{ fontSize: "16px" }}
                            ></i>
                            Hình ảnh bò sát
                          </label>

                          {/* Ảnh xem trước */}
                          {previewImage && (
                            <div
                              className="text-center mb-3"
                              style={{
                                background: "#f8f9fa",
                                padding: "10px",
                                borderRadius: "10px",
                                border: "1px solid #dee2e6",
                              }}
                            >
                              <img
                                src={previewImage}
                                alt="Preview"
                                style={{
                                  maxWidth: "100%",
                                  maxHeight: "200px",
                                  objectFit: "cover",
                                  borderRadius: "8px",
                                  boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                                }}
                              />
                            </div>
                          )}

                          {/* Input Upload */}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            ref={fileInputRef}
                            disabled={isUploading}
                            style={{
                              width: "100%",
                              padding: "10px 14px",
                              border: "2px dashed #ccc",
                              borderRadius: "12px",
                              backgroundColor: "#fff",
                              fontSize: "15px",
                              transition: "border-color 0.3s",
                            }}
                            onFocus={(e) => {
                              e.target.style.borderColor = "#2196f3";
                            }}
                            onBlur={(e) => {
                              e.target.style.borderColor = "#ccc";
                            }}
                          />
                          <small className="text-muted d-block mt-2">
                            📎 Định dạng hỗ trợ:{" "}
                            <strong>JPG, PNG, GIF, WebP</strong>. Kích thước tối
                            đa: <strong>5MB</strong>.
                          </small>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="text-center">
                      <div className="d-flex justify-content-center gap-3">
                        <Link
                          to="/LibraryExpert"
                          className="btn btn-secondary"
                          style={{
                            borderRadius: "25px",
                            padding: "15px 30px",
                            fontSize: "16px",
                            fontWeight: "600",
                            border: "none",
                            boxShadow: "0 4px 15px rgba(108, 117, 125, 0.3)",
                            transition: "all 0.3s ease",
                          }}
                        >
                          <i className="fas fa-times me-2"></i>
                          Hủy bỏ
                        </Link>
                        <button
                          className="btn btn-success"
                          disabled={loading} // Vô hiệu hóa nút khi đang tải
                          style={{
                            borderRadius: "25px",
                            padding: "15px 30px",
                            fontSize: "16px",
                            fontWeight: "600",
                            border: "none",
                            boxShadow: "0 4px 15px rgba(40, 167, 69, 0.3)",
                            transition: "all 0.3s ease",
                            minWidth: "150px",
                          }}
                          onClick={handleSubmit} // Gọi hàm handleSubmit trực tiếp
                          onMouseEnter={(e) => {
                            if (!loading) {
                              e.target.style.transform = "translateY(-2px)";
                              e.target.style.boxShadow =
                                "0 6px 20px rgba(40, 167, 69, 0.4)";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!loading) {
                              e.target.style.transform = "translateY(0)";
                              e.target.style.boxShadow =
                                "0 4px 15px rgba(40, 167, 69, 0.3)";
                            }
                          }}
                        >
                          {loading ? (
                            <>
                              <div
                                className="spinner-border spinner-border-sm me-2"
                                role="status"
                                style={{ width: "16px", height: "16px" }}
                              >
                                <span className="visually-hidden">
                                  Loading...
                                </span>
                              </div>
                              Đang tạo...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-save me-2"></i>
                              Tạo bò sát
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default LibraryExpertCreate;
