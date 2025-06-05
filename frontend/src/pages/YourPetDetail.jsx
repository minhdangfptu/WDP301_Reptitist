"use client";

/* eslint-disable no-console */
import { useEffect, useState } from "react";
import { Button, ListGroup, Modal } from "react-bootstrap";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PetBasicInfo from "../components/PetBasicInfo";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import AIChat from "../components/AIChat";

export default function YourPetDetail() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [petDetails, setPetDetails] = useState(null); // State to hold pet details
  const [loading, setLoading] = useState(true); // State for loading status
  const [error, setError] = useState(null); // State for error handling
  const [showAIChat, setShowAIChat] = useState(false); // State to control ReptiAI chat modal
  const navigate = useNavigate(); // Hook to navigate programmatically
  const { reptileId } = useParams();
  useEffect(() => {
    axios
      .get(`http://localhost:8080/reptitist/pet/${reptileId}`)
      .then((response) => {
        setPetDetails(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("There was an error fetching pet details:", error);
        setError("Could not fetch pet details.");
        setLoading(false);
      });
  }, [reptileId]); // This will run whenever the reptileId changes
  console.log(petDetails); // Log pet details to console for debugging

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "18px",
        }}
      >
        <img src="/loading.gif" alt="loading" />
      </div>
    ); // Show loading message while fetching data
  }

  if (error) {
    return <div>{error}</div>; // Show error message if there was an issue fetching data
  }

  const menuItems = [
    {
      title: "THÔNG TIN CƠ BẢN",
      items: [
        "Tên",
        "Tuổi",
        "Giống loài",
        "Cân nặng",
        "Sức khỏe",
        "Bệnh lý",
        "Tình trạng hoạt động",
      ],
    },
    {
      title: "THEO DÕI SỨC KHỎE",
      items: ["Tăng trưởng", "Chế độ dinh dưỡng", "Lịch sử điều trị"],
    },
    {
      title: "GỢI Ý CẢI THIỆN",
      items: ["Nâng cao hoạt động", "Môi trường", "Dinh dưỡng", "Bệnh lý"],
    },
    {
      title: "REPTIAI",
      items: ["Chat trực tiếp với AI", "Lịch sử trò chuyện", "Ghi chú"],
    },
  ];
  const handleAIClick = () => {
    navigate(`/your-pet/ai/${reptileId}`); 
  };
  return (
    <div className="min-vh-100 bg-light">
      {/* Hero Header */}
      <Header />
      <div
        className="hero-banner"
        style={{
          background: `url(${petDetails.user_reptile_imageurl}) no-repeat center center`,
          backgroundSize: "cover",
          position: "relative",
          height: "150px",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.2)", // Lớp phủ đen với opacity 20%
          }}
        ></div>
        <div className="hero-overlay" style={{ paddingBottom: "5px" }}>
          <h1 className="hero-title">{petDetails.reptile_name}</h1>
          <p className="hero-description">{petDetails.reptile_species}</p>
        </div>
      </div>

      <div className="d-flex">
        {/* Sidebar */}
        <div
          className="bg-white shadow d-none d-lg-flex flex-column"
          style={{
            width: "15rem",
            height: "100%",
            position: "sticky",
            top: 0,
          }}
        >
          {/* Sidebar Header */}
          <div className="p-3 border-bottom">
            <div className="d-flex align-items-center">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center me-2 text-white fw-bold"
                style={{
                  width: "2rem",
                  height: "2rem",
                  // backgroundColor: "#20c997",
                }}
              >
                <img src="/loading.gif" alt="loading" />
              </div>
              <span className="fw-semibold">{petDetails.name}</span>
            </div>
          </div>

          {/* Sidebar Content */}
          <div className="p-3 overflow-auto flex-grow-1" style={{ flex: 1 }}>
            {menuItems.map((section, index) => (
              <div key={index} className="mb-4">
                <h6 className="fw-semibold text-secondary small mb-2">
                  {section.title}
                </h6>
                <ListGroup variant="flush">
                  {section.items.map((item, itemIndex) => (
                    <ListGroup.Item
                      key={itemIndex}
                      action
                      className="border-0 py-1 px-2 text-secondary small"
                      style={{ backgroundColor: "transparent" }}
                    >
                      {item}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </div>
            ))}
          </div>
        </div>
        <div className="flex-grow-1 p-4">
          {/* Basic Information Section */}
          <PetBasicInfo petInfo={petDetails} />

          {/* AI Chat Button */}
          <div className="text-center mt-4">
            <Button
              variant="success"
              className="d-flex align-items-center mx-auto px-4 py-2"
              onClick={handleAIClick}
              style={{
                borderRadius: "50px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                fontSize: "16px",
              }}
            >
              <i className="bi bi-robot me-2" style={{ fontSize: "20px" }}></i>
              <span>Chat cùng ReptiAI</span>
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
