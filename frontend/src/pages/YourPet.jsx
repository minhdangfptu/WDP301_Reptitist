"use client";

/* eslint-disable no-console */
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../css/YourPet.css";
import { ToastContainer, toast } from "react-toastify";
import { baseUrl } from '../config';

const YourPet = () => {
  const deleteButtonStyle = {
    position: "absolute",
    top: "10px",
    right: "10px",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    border: "none",
    borderRadius: "50%",
    width: "36px",
    height: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    zIndex: 10,
    padding: 0,
    transition: "background-color 0.2s ease",
  };

  const deleteIconStyle = {
    color: "white",
    fontSize: "20px",
  };

  const { user } = useAuth();
  const [userPets, setUserPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const userId = user ? user.id : null;

  useEffect(() => {
    if (userId) {
      setLoading(true);
      axios
        .get(`${baseUrl}/reptitist/pet/get-reptile/${userId}`)
        .then((response) => {
          setUserPets(response.data);
          setLoading(false);
          // console.log(response.data); 
        })
        .catch((error) => {
          console.error("There was an error fetching the user pets:", error);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [userId]);

  const handlePetClick = (reptileId) => {
    navigate(`/your-pet/detail/${reptileId}`); 
  };

  const handleDeletePet = async (event, reptileId) => {
    event.stopPropagation(); 

    const isConfirmed = window.confirm(
      "Bạn có chắc chắn muốn xóa con thú cưng này?"
    );
    if (isConfirmed) {
      try {
        const response = await axios.delete(
          `${baseUrl}/reptitist/pet/${reptileId}`
        );
        // console.log("Pet deleted successfully", response.data);
        toast.success("Thú cưng đã được xóa thành công!");
        setUserPets(userPets.filter((pet) => pet._id !== reptileId));
      } catch (error) {
        console.error("Error deleting pet", error);
        toast.error("Có lỗi xảy ra khi xóa thú cưng."); // Hiển thị thông báo lỗi
      }
    }
  };

  
  const handleCreatePetClick = () => {
    navigate(`/your-pet/create`); 
  };

  if (loading) {
    return (
      <div className="your-pet-page">
        <Header />
        <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <img src="/loading.gif" alt="Loading" style={{ width: 50, height: 50, marginRight: 12 }} />
          Đang tải thú cưng...
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="your-pet-page">
      <Header />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar
        newestOnTop
        closeButton
      />

      {/* Hero Banner */}
      <div className="hero-banner">
        <div className="hero-overlay">
          <h1 className="hero-title">BÒ SÁT CỦA BẠN</h1>
          <p className="hero-description">
            Bạn có yêu thú cưng bò sát của mình không? Hãy chia sẻ cho cộng đồng
            về những điều thú vị mà bạn đã trải nghiệm cùng chúng. Hãy cập nhật
            thường xuyên thông tin về thú cưng của bạn để chúng tôi có thể hỗ
            trợ bạn chăm sóc chúng tốt nhất.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container">
        <div className="pet-selection-section">
          <h2 className="section-title">CHỌN BÒ SÁT CỦA BẠN</h2>
          <p className="section-description">Bấm vào hình ảnh để tiếp tục</p>

          <div className="pet-grid">
            {userPets.map((pet) => (
              <div
                key={pet._id}
                className="pet-card"
                onClick={() => handlePetClick(pet._id)}
              >
                <div className="pet-image-container">
                  <img
                    src={pet.user_reptile_imageurl || "/placeholder.svg"}
                    alt={pet.name}
                    className="pet-image"
                  />
                  <button
                    style={deleteButtonStyle}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor =
                        "rgba(0, 0, 0, 0.7)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor =
                        "rgba(0, 0, 0, 0.5)";
                    }}
                    onClick={(e) => handleDeletePet(e, pet._id)}
                    aria-label="Delete pet"
                  >
                    <i className="bi bi-trash-fill" style={deleteIconStyle}></i>
                  </button>
                </div>
                <h3 className="pet-name">{pet.name}</h3>
              </div>
            ))}

            {/* Thêm thú cưng mới */}
            <div
              className="pet-card add-pet-card"
              onClick={handleCreatePetClick}
            >
              <div className="pet-image-container add-pet-container">
                <span className="add-icon">+</span>
              </div>
              <h3 className="pet-name">Thêm thú cưng</h3>
            </div>
          </div>

          <div className="action-btn-container">
            <button className="view-more-btn">Xem thêm</button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default YourPet;