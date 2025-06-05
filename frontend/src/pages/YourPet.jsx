/* eslint-disable no-console */
import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../css/YourPet.css";

import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";
import { useState } from "react";

const YourPet = () => {
  const { user, updateUser } = useAuth();
  const [userPets, setUserPets] = useState([]);
  // Dữ liệu thú cưng của người dùng
  const userId = user ? user.id : null; // Lấy ID người dùng từ context hoặc state
  
  // const userPets = [
   useEffect(() => {
    if (userId) {
      // Gọi API để lấy danh sách thú cưng của người dùng
      axios
        .get(`http://localhost:8080/reptitist/info/get-reptile/${userId}`)
        .then((response) => {
          // Cập nhật danh sách thú cưng
          setUserPets(response.data); // Giả sử response.data chứa danh sách thú cưng
        })
        .catch((error) => {
          console.error("There was an error fetching the user pets:", error);
        });
    }
  }, [userId]);
  //     id: 1,
  //     name: "Mảng Đinh",
  //     type: "pet",
  //     image: "/prorep1.png",
  //   },
  //   {
  //     id: 2,
  //     name: "Mảng Đinh",
  //     type: "pet",
  //     image: "/prorep2.png",
  //   },
  //   {
  //     id: 3,
  //     name: "Mảng Đinh",
  //     type: "pet",
  //     image: "/prorep3.png",
  //   },
  // ];

  return (
    <div className="your-pet-page">
      <Header />
      
      {/* Hero Banner */}
      <div className="hero-banner">
        <div className="hero-overlay">
          <h1 className="hero-title">BÒ SÁT CỦA BẠN</h1>
          <p className="hero-description">
            Bạn có yêu thú cưng bò sát của mình không? Hãy chia sẻ cho cộng đồng về những điều thú vị mà bạn đã trải nghiệm cùng chúng. Hãy cập nhật thường xuyên thông tin về thú cưng của bạn để chúng tôi có thể hỗ trợ bạn chăm sóc chúng tốt nhất.
          </p>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container">
        <div className="pet-selection-section">
          <h2 className="section-title">CHỌN BÒ SÁT CỦA BẠN</h2>
          <p className="section-description">Bấm vào hình ảnh để tiếp tục</p>
          
          <div className="pet-grid">
            {/* Render danh sách bò sát của người dùng */}
            {userPets.map(pet => (
              <div key={pet.id} className="pet-card">
                <div className="pet-image-container">
                  <img src={pet.user_reptile_imageurl} alt={pet.name} className="pet-image" />
                </div>
                <h3 className="pet-name">{pet.name}</h3>
              </div>
            ))}
            
            {/* Thêm thú cưng mới */}
            <div className="pet-card add-pet-card">
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