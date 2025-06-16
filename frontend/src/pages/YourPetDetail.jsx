"use client";

/* eslint-disable no-console */
import { useEffect, useState } from "react";
import { Button, ListGroup, Modal } from "react-bootstrap";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PetBasicInfo from "../components/PetBasicInfo";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import AIChatPage from "./AIChatPage";
import TrackingHealth from "../components/TrackingHealth";
import ImproveSuggestion from "../components/ImproveSuggestion";
import { baseUrl } from '../config';

export default function YourPetDetail() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [petDetails, setPetDetails] = useState(null); // State to hold pet details
  const [loading, setLoading] = useState(true); // State for loading status
  const [error, setError] = useState(null); // State for error handling
  const [showAIChat, setShowAIChat] = useState(false); // State to control ReptiAI chat modal
  const navigate = useNavigate(); // Hook to navigate programmatically
  const { reptileId } = useParams();
  const [openSections, setOpenSections] = useState({});
  const [selectedSection, setSelectedSection] = useState(0); // Section đang chọn

  useEffect(() => {
    axios
      .get(`${baseUrl}/reptitist/pet/${reptileId}`)
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

  const handleToggleSection = (index) => {
    setOpenSections((prev) => ({
      ...prev, 
      [index]: !prev[index],
    }));
  };

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
        "Các thông tin khác"
      ],
    },
    {
      title: "THEO DÕI SỨC KHỎE",
      items: ["Tăng trưởng", "Chế độ dinh dưỡng"],
    },
    {
      title: "REPTIAI GỢI Ý CẢI THIỆN",
      items: ["Nâng cao hoạt động", "Môi trường", "Dinh dưỡng", "Bệnh lý"],
    },
    {
      title: "CHAT VỚI REPTIAI",
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
            height: "100%", // Chiều cao cố định
            position: "sticky",
            top: 0,
            left: 0,
            zIndex: 10,
            overflow: "auto"
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
                <Button
                  className="w-100 text-start mb-2"
                  style={{
                    backgroundColor: selectedSection === index ? "var(--primary-color)" : "#fff",
                    color: selectedSection === index ? "#fff" : "var(--primary-color)",
                    border: "1px solid var(--primary-color)",
                    fontWeight: "bold",
                   

                    transition: "all 0.2s",
                    padding: "6px 6px",
                    fontSize: "14px",
                    borderRadius: "10px",
                    
                  }}
                  onClick={() => setSelectedSection(index)}
                >
                  {section.title}
                </Button>
                <ListGroup variant="flush" className="mb-3">
                  {section.items.map((item, itemIndex) => (
                    <ListGroup.Item
                      key={itemIndex}
                      className="border-0 py-1 px-3 text-secondary small"
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
        <div className="flex-grow-1 p-4 h-100" style={{height: "100%"}}>
          {/* Hiển thị component theo section được chọn */}
          {selectedSection === 0 && <PetBasicInfo petInfo={petDetails} />}
          {selectedSection === 1 && <TrackingHealth petInfo={petDetails} />}
          {selectedSection === 2 && <ImproveSuggestion petInfo={petDetails} />}
          {selectedSection === 3 && (
            <div
              
              className="h-100"
              style={{
                paddingBottom: "50px",
                height: "100%",
                overflowY: "auto",
                minHeight: 0, 
              }}
            >
              <AIChatPage petInfo={petDetails} />
            </div>
          )}
          
        </div>
      </div>
      <Footer />
    </div>
  );
}
