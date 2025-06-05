/* eslint-disable no-console */
"use client";

import { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  InputGroup,
  Nav,
  Badge,
  ListGroup,
} from "react-bootstrap";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { useParams } from "react-router-dom";

const AIChatPage = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState("chat");
  const [message, setMessage] = useState("");
  const [useReptileData, setUseReptileData] = useState(true);
  const [chatHistory, setChatHistory] = useState(null);
  const [chatDataBaseHistory, setChatDataBaseHistory] = useState(null);
  const [loading, setLoading] = useState(true); // State for loading status
  const [error, setError] = useState(null); // State for error handling
  const [newChatCreated, setNewChatCreated] = useState(false);
  const [messageSent, setMessageSent] = useState(false);
  const { user } = useAuth();
  const username = user ? user.username : null;
  const { reptileId } = useParams();

  const tools = [
    {
      icon: "bi-journal-text",
      title: "Hướng dẫn",
      subtitle: "chăm sóc",
      color: "#28a745",
    },
    {
      icon: "bi-calendar-check",
      title: "Lập kế hoạch",
      subtitle: "dinh dưỡng",
      color: "#28a745",
    },
    {
      icon: "bi-gear",
      title: "Cấu hình",
      subtitle: "chuồng",
      color: "#6c757d",
    },
    {
      icon: "bi-graph-up",
      title: "Kiểm tra",
      subtitle: "sức khỏe",
      color: "#28a745",
    },
    {
      icon: "bi-people",
      title: "Tìm kiếm",
      subtitle: "chuyên gia",
      color: "#28a745",
    },
    {
      icon: "bi-heart",
      title: "Lên lịch",
      subtitle: "vận động",
      color: "#28a745",
    },
  ];

  // Fetch history using the reptileId from the URL parameters
  useEffect(
    () => {
      axios
        .get(`http://localhost:8080/reptitist/ai/get-ai-history/${reptileId}`)
        .then((response) => {
          setChatDataBaseHistory(response.data);
          setChatHistory(response.data);
          setLoading(false);
        })
        .catch((error) => {
          console.error("There was an error fetching pet details:", error);
          setError("Could not fetch pet details.");
          setLoading(false);
        });
    },
    [reptileId],
    [messageSent]
  );
  console.log(">>>Chat history after fetch:", chatHistory);
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

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  // Handle sending messages
  const handleSendMessage = async () => {
    if (message.trim() && chatHistory && chatHistory.length > 0) {
      const historyId = chatHistory[chatHistory.length - 1]._id; // Lấy historyId của chat mới nhất
      console.log("Sending message:", message);

      try {
        // Gửi tin nhắn người dùng vào cuộc trò chuyện hiện tại
        const response = await axios.put(
          `http://localhost:8080/reptitist/ai/update-conversation/${historyId}`,
          {
            ai_input: message, // Tin nhắn của người dùng
          }
        );
        console.log("Message sent:", response.data);

        // Cập nhật lại lịch sử chat sau khi gửi tin nhắn thành công
        setChatHistory((prevHistory) => [...prevHistory, response.data]);

        // Set messageSent to trigger useEffect to fetch new history
        setMessageSent((prev) => !prev); // Toggle the state to trigger useEffect

        setMessage(""); // Clear message input field
      } catch (error) {
        console.error("Error updating conversation:", error);
      }

      setMessage(""); // Clear input field
    } else {
      console.log("No message to send or chat history is not loaded.");
    }
  };
  const handleCreateChat = async () => {
    try {
      const response = await axios.post(
        "http://localhost:8080/reptitist/ai/new-conversation",
        {
          user_reptile_id: reptileId,
        }
      );
      console.log("New chat created:", response.data);

      // Cập nhật chatHistory với cuộc trò chuyện mới
      setChatHistory((prevHistory) => [...prevHistory, response.data]);

      setNewChatCreated(true); // Đánh dấu là đã tạo cuộc trò chuyện mới
      setMessage(""); // Clear message input field
      setMessageSent((prev) => !prev);
    } catch (error) {
      console.error("Error creating new chat:", error);
    }
  };

  return (
    <>
      <Header />
      <Container
        style={{
          fontFamily: "Poppins, sans-serif",
          height: "90vh",
          paddingTop: "20px",
          paddingBottom: "20px",
        }}
      >
        <Row className="h-100 g-0">
          {/* Left Panel - Chat Interface */}
          <Col md={8} className="d-flex flex-column">
            {/* Header with Navigation Tabs */}
            <div
              style={{
                padding: "15px 15px 0",
                backgroundColor: "white",
                borderRadius: "15px 0 0 0",
              }}
            >
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h3
                  style={{
                    margin: 0,
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                    color: "#333",
                  }}
                >
                  {username} cần ReptiAI hỗ trợ gì nhỉ?
                  <span
                    style={{ fontSize: "1.2rem" }}
                    role="img"
                    aria-label="lizard"
                  >
                    🦎
                  </span>
                </h3>
                <div style={{ display: "flex", gap: "8px" }}>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    style={{
                      border: "none",
                      background: "none",
                      padding: "4px",
                    }}
                  >
                    <i className="bi bi-arrows-fullscreen"></i>
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    style={{
                      border: "none",
                      background: "none",
                      padding: "4px",
                    }}
                    onClick={onClose}
                  >
                    <i className="bi bi-x-lg"></i>
                  </Button>
                </div>
              </div>

              <Nav variant="tabs" style={{ borderBottom: "1px solid #dee2e6" }}>
                <Nav.Item>
                  <Nav.Link
                    active={activeTab === "chat"}
                    onClick={() => setActiveTab("chat")}
                    style={{
                      fontSize: "12px",
                      padding: "8px 12px",
                      color: activeTab === "chat" ? "#28a745" : "#666",
                      borderColor:
                        activeTab === "chat" ? "#28a745" : "transparent",
                    }}
                  >
                    Giao tiếp
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link
                    active={activeTab === "schedule"}
                    onClick={() => setActiveTab("schedule")}
                    style={{
                      fontSize: "12px",
                      padding: "8px 12px",
                      color: activeTab === "schedule" ? "#28a745" : "#666",
                      borderColor:
                        activeTab === "schedule" ? "#28a745" : "transparent",
                    }}
                  >
                    Lịch theo dõi
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link
                    active={activeTab === "docs"}
                    onClick={() => setActiveTab("docs")}
                    style={{
                      fontSize: "12px",
                      padding: "8px 12px",
                      color: activeTab === "docs" ? "#28a745" : "#666",
                      borderColor:
                        activeTab === "docs" ? "#28a745" : "transparent",
                    }}
                  >
                    Tài liệu
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link
                    active={activeTab === "all"}
                    onClick={() => setActiveTab("all")}
                    style={{
                      fontSize: "12px",
                      padding: "8px 12px",
                      color: activeTab === "all" ? "#28a745" : "#666",
                      borderColor:
                        activeTab === "all" ? "#28a745" : "transparent",
                    }}
                  >
                    Tất cả
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </div>

            {/* Chat Messages Area */}
            <div
              style={{
                flex: 1,
                backgroundColor: "white",
                padding: "20px",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                color: "#666",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <i
                  className="bi bi-chat-dots"
                  style={{
                    fontSize: "48px",
                    color: "#dee2e6",
                    marginBottom: "16px",
                  }}
                ></i>
                <h5 style={{ color: "#666", marginBottom: "8px" }}>
                  Chào mừng đến với ReptiAI!
                </h5>
                <p style={{ fontSize: "14px", color: "#999" }}>
                  Hãy bắt đầu cuộc trò chuyện về thú cưng bò sát của bạn
                </p>
              </div>
            </div>

            {/* Chat Input and New Chat Button */}
            <div
              style={{
                padding: "15px",
                backgroundColor: "white",
                borderRadius: "0 0 0 20px",
              }}
            >
              {newChatCreated ? (
                <InputGroup style={{ marginBottom: "10px" }}>
                  <Form.Control
                    type="text"
                    placeholder="Hỏi ReptiAI về thú cưng của bạn..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    style={{
                      border: "1px solid #dee2e6",
                      borderRadius: "20px 0 0 20px",
                      fontSize: "14px",
                      padding: "10px 15px",
                      outline: "none",
                      boxShadow: "none",
                    }}
                  />
                  <Button
                    variant="success"
                    onClick={handleSendMessage}
                    style={{
                      borderRadius: "0 20px 20px 0",
                      border: "none",
                      padding: "10px 15px",
                    }}
                  >
                    <i className="bi bi-send"></i>
                  </Button>
                </InputGroup>
              ) : (
                <Button
                  variant="success"
                  onClick={handleCreateChat}
                  style={{
                    width: "100%",
                    padding: "12px 15px",
                    fontSize: "14px",
                    borderRadius: "30px",
                  }}
                >
                  Tạo cuộc trò chuyện mới
                </Button>
              )}
            </div>
          </Col>

          {/* Right Panel - Tools and Features */}
          <Col
            md={4}
            className="d-flex flex-column"
            style={{
              backgroundColor: "#f8f9fa",
              borderRadius: "0 15px 15px 0",
            }}
          >
            {/* Tools Section */}
            <Card
              style={{
                border: "none",
                boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                margin: "15px",
              }}
            >
              <Card.Body style={{ padding: "12px" }}>
                <h6
                  style={{
                    color: "#28a745",
                    fontWeight: "600",
                    marginBottom: "12px",
                    fontSize: "14px",
                  }}
                >
                  Công cụ
                </h6>
                <Row className="g-1">
                  {tools.map((tool, index) => (
                    <Col xs={4} key={index}>
                      <div
                        style={{
                          textAlign: "center",
                          padding: "8px 4px",
                          cursor: "pointer",
                          borderRadius: "6px",
                          transition: "background-color 0.2s",
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = "#f8f9fa";
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        <div
                          style={{
                            width: "32px",
                            height: "32px",
                            backgroundColor: tool.color,
                            borderRadius: "6px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 6px",
                          }}
                        >
                          <i
                            className={tool.icon}
                            style={{ color: "white", fontSize: "14px" }}
                          ></i>
                        </div>
                        <div
                          style={{
                            fontSize: "9px",
                            lineHeight: "1.1",
                            color: "#333",
                          }}
                        >
                          <div style={{ fontWeight: "600" }}>{tool.title}</div>
                          <div>{tool.subtitle}</div>
                        </div>
                      </div>
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>

            {/* Features Section */}
            <div style={{ padding: "0 15px 15px", flex: 1, overflowY: "auto" }}>
              <Card
                style={{
                  border: "none",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                  marginBottom: "12px",
                }}
              >
                <Card.Body style={{ padding: "12px" }}>
                  <h6
                    style={{
                      color: "#28a745",
                      fontWeight: "600",
                      marginBottom: "10px",
                      fontSize: "13px",
                    }}
                  >
                    Các tính năng nổi bật
                  </h6>
                  <Row>
                    <Col xs={4}>
                      <div
                        style={{
                          fontSize: "10px",
                          color: "#666",
                          marginBottom: "8px",
                        }}
                      >
                        Công cụ tạo hình
                        <br />
                        Hỗ trợ 10+ model
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: "3px",
                          alignItems: "center",
                        }}
                      >
                        <div
                          style={{
                            width: "16px",
                            height: "16px",
                            borderRadius: "50%",
                            background:
                              "linear-gradient(45deg, #ff6b6b, #4ecdc4)",
                          }}
                        ></div>
                        <div
                          style={{
                            width: "16px",
                            height: "16px",
                            borderRadius: "50%",
                            background:
                              "linear-gradient(45deg, #45b7d1, #96ceb4)",
                          }}
                        ></div>
                        <span
                          style={{
                            fontSize: "12px",
                            fontWeight: "bold",
                            color: "#8e44ad",
                            marginLeft: "3px",
                          }}
                        >
                          S.
                        </span>
                      </div>
                    </Col>
                    <Col xs={4}>
                      <div
                        style={{
                          fontSize: "10px",
                          color: "#666",
                          marginBottom: "8px",
                        }}
                      >
                        Hướng dẫn video
                        <br />
                        Model pro
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: "2px",
                          flexWrap: "wrap",
                        }}
                      >
                        <Badge
                          bg="primary"
                          style={{ fontSize: "8px", padding: "2px 4px" }}
                        >
                          S.
                        </Badge>
                        <Badge
                          bg="info"
                          style={{ fontSize: "8px", padding: "2px 4px" }}
                        >
                          <i className="bi bi-chat"></i>
                        </Badge>
                        <Badge
                          bg="danger"
                          style={{ fontSize: "8px", padding: "2px 4px" }}
                        >
                          R
                        </Badge>
                      </div>
                    </Col>
                    <Col xs={4}>
                      <p
                        style={{
                          fontSize: "10px",
                          color: "#666",
                          marginBottom: "8px",
                        }}
                      >
                        Liên hệ khẩn cấp
                        <br />
                        Hotline
                      </p>
                      <div
                        style={{
                          display: "flex",
                          gap: "4px",
                          flexWrap: "wrap",
                        }}
                      >
                        <Badge
                          bg="primary"
                          style={{ fontSize: "8px", padding: "3px 6px" }}
                        >
                          S.
                        </Badge>
                        <Badge
                          bg="info"
                          style={{ fontSize: "8px", padding: "3px 6px" }}
                        >
                          <i className="bi bi-chat"></i>
                        </Badge>
                        <Badge
                          bg="danger"
                          style={{ fontSize: "8px", padding: "3px 6px" }}
                        >
                          <i className="bi bi-telephone"></i>
                        </Badge>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* App Download Section */}
              <Card
                style={{
                  border: "none",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                }}
              >
                <Card.Body style={{ padding: "12px" }}>
                  <Row>
                    <Col xs={9}>
                      <h6
                        style={{
                          color: "#28a745",
                          fontWeight: "600",
                          marginBottom: "6px",
                          fontSize: "13px",
                        }}
                      >
                        Tải ứng dụng để trải nghiệm tốt hơn
                      </h6>

                      <div style={{ display: "flex", gap: "18px" }}>
                        <img
                          src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Google_Play_Store_badge_EN.svg/2560px-Google_Play_Store_badge_EN.svg.png"
                          alt="Google Play"
                          style={{ height: "35px", borderRadius: "3px" }}
                        />
                        <img
                          src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Download_on_the_App_Store_Badge.svg/2560px-Download_on_the_App_Store_Badge.svg.png"
                          alt="App Store"
                          style={{ height: "35px", borderRadius: "3px" }}
                        />
                      </div>
                    </Col>
                    <Col xs={3}>
                      <div>
                        <img
                          style={{
                            width: "57px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "6px",
                            color: "white",
                          }}
                          src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/QR_Code_Example.svg/1200px-QR_Code_Example.svg.png"
                          alt="QR Code"
                        />
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
              {/* AIChat History Card  */}
              {/* AIChat History Card */}
              <Card
                style={{
                  border: "none",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                  marginTop: "12px",
                }}
              >
                <Card.Body style={{ padding: "12px" }}>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6
                      style={{
                        color: "#28a745",
                        fontWeight: "600",
                        fontSize: "13px",
                        margin: 0,
                      }}
                    >
                      Lịch sử trò chuyện
                    </h6>
                    <Badge bg="success" pill style={{ fontSize: "10px" }}>
                      Mới
                    </Badge>
                  </div>

                  {/* Map qua dữ liệu chatHistory, chỉ lấy tối đa 5 mục */}
                  <ListGroup variant="flush" style={{ fontSize: "12px" }}>
                    {chatDataBaseHistory.slice(0, 5).map((chat, index) =>
                      chat.ai_input && chat.ai_input.length > 0 ? ( // Kiểm tra nếu ai_input không rỗng
                        <ListGroup.Item
                          key={index}
                          action
                          className="border-bottom py-2 px-0"
                          style={{ backgroundColor: "transparent" }}
                        >
                          <div className="d-flex justify-content-between align-items-center">
                            <div
                              className="text-truncate"
                              style={{ maxWidth: "80%" }}
                            >
                              {/* Hiển thị phần tử đầu tiên trong ai_input */}
                              {chat.ai_input[0]}
                            </div>
                            <small
                              className="text-muted"
                              style={{ fontSize: "10px" }}
                            >
                              {new Date(chat.created_at).toLocaleDateString()}{" "}
                              {/* Hiển thị ngày tháng */}
                            </small>
                          </div>
                        </ListGroup.Item>
                      ) : null
                    )}
                  </ListGroup>
                </Card.Body>
              </Card>
            </div>
          </Col>
        </Row>
      </Container>
      <Footer />
    </>
  );
};

export default AIChatPage;
