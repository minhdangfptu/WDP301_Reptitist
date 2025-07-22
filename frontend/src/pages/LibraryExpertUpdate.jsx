import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { baseUrl } from "../config";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../css/LibraryDetail.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import reptileApi from "../api/reptileApi";

const LibraryExpertUpdate = () => {
  const { reptileId } = useParams();
  const [form, setForm] = useState({
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
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${baseUrl}/reptitist/info/get-all-reptile`)
      .then((res) => {
        const found = res.data.data.find((r) => r._id === reptileId);
        if (found) {
          setForm((prev) => ({
            ...prev,
            ...found,
            reptile_category: found.reptile_category || {
              class: "",
              order: "",
              family: "",
            },
            adult_size: found.adult_size || { min: "", max: "" },
            temperature_range: found.temperature_range || {
              day: ["", ""],
              night: ["", ""],
            },
            humidity_range_percent: found.humidity_range_percent || ["", ""],
            disease: found.disease || {
              day: "",
              prevention: "",
              treatment: "",
            },
          }));
          setPreviewImage(found.reptile_imageurl);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [reptileId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.includes(".")) {
      const [parent, child, index] = name.split(".");
      setForm((prev) => ({
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
      setForm((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("access_token");
      await reptileApi.updateReptile(reptileId, form, token);
      toast.success("Cập nhật thành công!"); 
      navigate(-1); 
    } catch (err) {
      // console.error(err);
      toast.error(
        "Đã xảy ra lỗi khi cập nhật thông tin. Vui lòng thử lại sau."
      );
    } finally {
      setLoading(false);
    }
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      if (!file) {
        console.warn("❌ No file provided");
        resolve(null);
        return;
      }

      const reader = new FileReader();

      reader.onload = () => {
        console.log("✅ FileReader.onload called");
        console.log("👉 Base64 result:", reader.result);
        resolve(reader.result);
      };

      reader.onerror = (error) => {
        console.error("❌ FileReader error:", error);
        reject(error);
      };

      reader.readAsDataURL(file);
    });
  };
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

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    console.log("File selected:", file); // 👈 BẮT BUỘC có log này
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.isValid) {
      toast.error(validation.error);
      return;
    }

    setIsUploading(true);

    try {
      const base64Data = await fileToBase64(file);
      setForm((prev) => ({ ...prev, reptile_imageurl: base64Data }));
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

  if (loading)
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
        Đang tải dữ liệu...
      </div>
    );

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
                "url('/images/library-bg.jpg') no-repeat center center",
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
              CHỈNH SỬA BÒ SÁT
            </h1>
            <p
              style={{
                fontSize: "1.1rem",
                margin: "10px 0 0 0",
                opacity: 0.9,
              }}
            >
              Cập nhật thông tin chi tiết về loài bò sát
            </p>
          </div>
        </div>

        <div className="container" style={{ padding: "40px 15px" }}>
          <form>
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
                    {/* Add all fields here with consistent styling */}
                    {/* Example: */}
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
                            value={form.common_name}
                            onChange={handleChange}
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
                            <i className="fas fa-tag me-2"></i>
                            Tên khoa học *
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            name="specific_name"
                            value={form.specific_name}
                            onChange={handleChange}
                            required
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
                    </div>
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
                        <i className="fas fa-list-alt me-2"></i>
                        Phân loại
                      </h4>
                      <div className="row">
                        <div className="col-md-4 mb-3">
                          <label
                            className="form-label"
                            style={{ fontWeight: "600", color: "#2c3e50" }}
                          >
                            <i className="fas fa-tree me-2"></i>
                            Bộ *
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            name="reptile_category.order"
                            value={form.reptile_category.order}
                            onChange={handleChange}
                            required
                            style={{
                              border: "2px solid #e9ecef",
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
                            style={{ fontWeight: "600", color: "#2c3e50" }}
                          >
                            <i className="fas fa-sitemap me-2"></i>
                            Họ *
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            name="reptile_category.family"
                            value={form.reptile_category.family}
                            onChange={handleChange}
                            required
                            style={{
                              border: "2px solid #e9ecef",
                              borderRadius: "10px",
                              padding: "12px 15px",
                              fontSize: "16px",
                            }}
                            placeholder="Ví dụ: Pythonidae"
                          />
                        </div>
                        <div className="col-md-4 mb-3">
                          <label
                            className="form-label"
                            style={{ fontWeight: "600", color: "#2c3e50" }}
                          >
                            <i className="fas fa-tags me-2"></i>
                            Giống hoặc biến thể
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            name="breed_or_morph"
                            value={form.breed_or_morph}
                            onChange={handleChange}
                            style={{
                              border: "2px solid #e9ecef",
                              borderRadius: "10px",
                              padding: "12px 15px",
                              fontSize: "16px",
                            }}
                            placeholder="Ví dụ: Albino, Hypo, etc."
                          />
                        </div>
                      </div>
                    </div>
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
                        <i className="fas fa-thermometer-half me-2"></i>
                        Nhiệt độ và độ ẩm
                      </h4>
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label
                            className="form-label"
                            style={{ fontWeight: "600", color: "#2c3e50" }}
                          >
                            <i className="fas fa-sun me-2"></i>
                            Nhiệt độ ban ngày (°C)
                          </label>
                          <div className="input-group">
                            <input
                              type="number"
                              className="form-control"
                              name="temperature_range.day.0"
                              value={form.temperature_range.day[0]}
                              onChange={handleChange}
                              style={{
                                border: "2px solid #e9ecef",
                                borderRadius: "10px 0 0 10px",
                                padding: "12px 15px",
                                fontSize: "16px",
                              }}
                              placeholder="Tối thiểu"
                            />
                            <input
                              type="number"
                              className="form-control"
                              name="temperature_range.day.1"
                              value={form.temperature_range.day[1]}
                              onChange={handleChange}
                              style={{
                                border: "2px solid #e9ecef",
                                borderRadius: "0 10px 10px 0",
                                padding: "12px 15px",
                                fontSize: "16px",
                              }}
                              placeholder="Tối đa"
                            />
                          </div>
                        </div>
                        <div className="col-md-6 mb-3">
                          <label
                            className="form-label"
                            style={{ fontWeight: "600", color: "#2c3e50" }}
                          >
                            <i className="fas fa-moon me-2"></i>
                            Nhiệt độ ban đêm (°C)
                          </label>
                          <div className="input-group">
                            <input
                              type="number"
                              className="form-control"
                              name="temperature_range.night.0"
                              value={form.temperature_range.night[0]}
                              onChange={handleChange}
                              style={{
                                border: "2px solid #e9ecef",
                                borderRadius: "10px 0 0 10px",
                                padding: "12px 15px",
                                fontSize: "16px",
                              }}
                              placeholder="Tối thiểu"
                            />
                            <input
                              type="number"
                              className="form-control"
                              name="temperature_range.night.1"
                              value={form.temperature_range.night[1]}
                              onChange={handleChange}
                              style={{
                                border: "2px solid #e9ecef",
                                borderRadius: "0 10px 10px 0",
                                padding: "12px 15px",
                                fontSize: "16px",
                              }}
                              placeholder="Tối đa"
                            />
                          </div>
                        </div>
                        <div className="col-md-6 mb-3">
                          <label
                            className="form-label"
                            style={{ fontWeight: "600", color: "#2c3e50" }}
                          >
                            <i className="fas fa-tint me-2"></i>
                            Độ ẩm (%) (Khoảng)
                          </label>
                          <div className="input-group">
                            <input
                              type="number"
                              className="form-control"
                              name="humidity_range_percent.0"
                              value={form.humidity_range_percent[0]}
                              onChange={handleChange}
                              style={{
                                border: "2px solid #e9ecef",
                                borderRadius: "10px 0 0 10px",
                                padding: "12px 15px",
                                fontSize: "16px",
                              }}
                              placeholder="Tối thiểu"
                            />
                            <input
                              type="number"
                              className="form-control"
                              name="humidity_range_percent.1"
                              value={form.humidity_range_percent[1]}
                              onChange={handleChange}
                              style={{
                                border: "2px solid #e9ecef",
                                borderRadius: "0 10px 10px 0",
                                padding: "12px 15px",
                                fontSize: "16px",
                              }}
                              placeholder="Tối đa"
                            />
                          </div>
                        </div>
                        <div className="col-md-6 mb-3">
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              name="uvb_required"
                              checked={form.uvb_required}
                              onChange={handleChange}
                              id="uvbRequiredCheck"
                              style={{ cursor: "pointer" }}
                            />
                            <label
                              className="form-check-label"
                              htmlFor="uvbRequiredCheck"
                              style={{
                                fontWeight: "600",
                                color: "#2c3e50",
                                cursor: "pointer",
                              }}
                            >
                              <i className="fas fa-sun me-2"></i>
                              Cần ánh sáng UVB
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
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
                        <i className="fas fa-leaf me-2"></i>
                        Môi trường sống tự nhiên
                      </h4>
                      <div className="mb-3">
                        <label
                          className="form-label"
                          style={{ fontWeight: "600", color: "#2c3e50" }}
                        >
                          <i className="fas fa-map-marker-alt me-2"></i>
                          Khu vực phân bố tự nhiên
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          name="natural_habitat"
                          value={form.natural_habitat}
                          onChange={handleChange}
                          style={{
                            border: "2px solid #e9ecef",
                            borderRadius: "10px",
                            padding: "12px 15px",
                            fontSize: "16px",
                          }}
                          placeholder="Ví dụ: Rừng nhiệt đới, savanna, etc."
                        />
                      </div>
                      <div className="mb-3">
                        <label
                          className="form-label"
                          style={{ fontWeight: "600", color: "#2c3e50" }}
                        >
                          <i className="fas fa-clock me-2"></i>
                          Thời gian hoạt động
                        </label>
                        <select
                          className="form-select"
                          name="activity_pattern"
                          value={form.activity_pattern}
                          onChange={handleChange}
                          style={{
                            border: "2px solid #e9ecef",
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
                          <option value="Hoạt động cả ngày lẫn đêm (Cathemeral)">
                            Hoạt động cả ngày lẫn đêm (Cathemeral)
                          </option>
                        </select>
                      </div>
                    </div>
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
                        <i className="fas fa-utensils me-2"></i>
                        Chế độ ăn uống
                      </h4>
                      <div className="mb-3">
                        <label
                          className="form-label"
                          style={{ fontWeight: "600", color: "#2c3e50" }}
                        >
                          <i className="fas fa-carrot me-2"></i>
                          Thức ăn chính
                        </label>
                        <select
                          className="form-select"
                          name="diet"
                          value={form.diet}
                          onChange={handleChange}
                          style={{
                            border: "2px solid #e9ecef",
                            borderRadius: "10px",
                            padding: "12px 15px",
                            fontSize: "16px",
                          }}
                        >
                          <option value="">Chọn chế độ ăn</option>
                          <option value="Carnivore (Ăn thịt)">
                            Ăn thịt (Carnivore)
                          </option>
                          <option value="Herbivore (Ăn cỏ)">
                            Ăn cỏ (Herbivore)
                          </option>
                          <option value="Omnivore (Ăn tạp)">
                            Ăn tạp (Omnivore)
                          </option>
                          <option value="Insectivore (Ăn côn trùng)">
                            Ăn côn trùng (Insectivore)
                          </option>
                        </select>
                      </div>
                      <div className="mb-3">
                        <label
                          className="form-label"
                          style={{ fontWeight: "600", color: "#2c3e50" }}
                        >
                          <i className="fas fa-ban me-2"></i>
                          Thức ăn cấm
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          name="prohibited_foods"
                          value={form.prohibited_foods}
                          onChange={handleChange}
                          style={{
                            border: "2px solid #e9ecef",
                            borderRadius: "10px",
                            padding: "12px 15px",
                            fontSize: "16px",
                          }}
                          placeholder="Ví dụ: Thức ăn có xương, thức ăn ôi thiu, etc."
                        />
                      </div>
                      <div className="mb-3">
                        <label
                          className="form-label"
                          style={{ fontWeight: "600", color: "#2c3e50" }}
                        >
                          <i className="fas fa-check-circle me-2"></i>
                          Thức ăn khuyến nghị
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          name="recommended_foods"
                          value={form.recommended_foods}
                          onChange={handleChange}
                          style={{
                            border: "2px solid #e9ecef",
                            borderRadius: "10px",
                            padding: "12px 15px",
                            fontSize: "16px",
                          }}
                          placeholder="Ví dụ: Thịt gà, cá hồi, rau xanh, etc."
                        />
                      </div>
                    </div>
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
                        <i className="fas fa-medkit me-2"></i>
                        Bệnh tật và chăm sóc sức khỏe
                      </h4>
                      <div className="mb-3">
                        <label
                          className="form-label"
                          style={{ fontWeight: "600", color: "#2c3e50" }}
                        >
                          <i className="fas fa-procedures me-2"></i>
                          Bệnh thường gặp
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          name="disease.day"
                          value={form.disease.day}
                          onChange={handleChange}
                          style={{
                            border: "2px solid #e9ecef",
                            borderRadius: "10px",
                            padding: "12px 15px",
                            fontSize: "16px",
                          }}
                          placeholder="Ví dụ: Viêm phổi, tiêu chảy, etc."
                        />
                      </div>
                      <div className="mb-3">
                        <label
                          className="form-label"
                          style={{ fontWeight: "600", color: "#2c3e50" }}
                        >
                          <i className="fas fa-shield-alt me-2"></i>
                          Phòng ngừa
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          name="disease.prevention"
                          value={form.disease.prevention}
                          onChange={handleChange}
                          style={{
                            border: "2px solid #e9ecef",
                            borderRadius: "10px",
                            padding: "12px 15px",
                            fontSize: "16px",
                          }}
                          placeholder="Ví dụ: Tiêm phòng, vệ sinh chuồng trại, etc."
                        />
                      </div>
                      <div className="mb-3">
                        <label
                          className="form-label"
                          style={{ fontWeight: "600", color: "#2c3e50" }}
                        >
                          <i className="fas fa-hospital-alt me-2"></i>
                          Điều trị
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          name="disease.treatment"
                          value={form.disease.treatment}
                          onChange={handleChange}
                          style={{
                            border: "2px solid #e9ecef",
                            borderRadius: "10px",
                            padding: "12px 15px",
                            fontSize: "16px",
                          }}
                          placeholder="Ví dụ: Kháng sinh, thuốc chống viêm, etc."
                        />
                      </div>
                    </div>
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
                        <i className="fas fa-pencil-alt me-2"></i>
                        Mô tả chi tiết
                      </h4>
                      <div className="mb-3">
                        <label
                          className="form-label"
                          style={{ fontWeight: "600", color: "#2c3e50" }}
                        >
                          <i className="fas fa-file-alt me-2"></i>
                          Thông tin bổ sung
                        </label>
                        <textarea
                          className="form-control"
                          name="reptile_description"
                          value={form.reptile_description}
                          onChange={handleChange}
                          rows="4"
                          style={{
                            border: "2px solid #e9ecef",
                            borderRadius: "10px",
                            padding: "12px 15px",
                            fontSize: "16px",
                          }}
                          placeholder="Thông tin thêm về loài bò sát này."
                        ></textarea>
                      </div>
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

                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            ref={fileInputRef}
                            disabled={isUploading}
                            style={{
                              cursor: "pointer",
                              border: "2px dashed #ccc",
                              borderRadius: "12px",
                              backgroundColor: "#fff",
                              fontSize: "15px",
                              padding: "10px 14px",
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
                    <div className="text-center">
                      <button
                        type="submit"
                        onClick={handleSubmit}
                        className="btn btn-success"
                        style={{
                          padding: "12px 30px",
                          fontSize: "18px",
                          borderRadius: "10px",
                          border: "none",
                          backgroundColor: "#28a745",
                          color: "white",
                          fontWeight: "600",
                          transition: "background-color 0.3s",
                        }}
                      >
                        <i className="fas fa-save me-2"></i>
                        Lưu thay đổi
                      </button>
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

export default LibraryExpertUpdate;
