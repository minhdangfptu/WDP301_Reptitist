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
  const [userMessage, setUserMessage] = useState(null); // Store user message
  const [aiMessage, setAiMessage] = useState(null); // Store AI response

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
  useEffect(() => {
    axios
      .get(`http://localhost:8080/reptitist/ai/get-ai-history/${reptileId}`)
      .then((response) => {
        setChatDataBaseHistory(response.data);
        setChatHistory(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching chat history:", error);
        setError("Could not fetch chat history.");
        setLoading(false);
      });
  }, [reptileId, messageSent]);
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
    if (message.trim()) {
      const newUserMessage = message;
      setMessage(""); // Clear input field

      // Add user's message immediately to the chat history
      setChatHistory((prevHistory) => [
        ...prevHistory,
        { ai_input: [newUserMessage], ai_response: [] },
      ]);

      setLoading(true);

      try {
        const response = await axios.put(
          `http://localhost:8080/reptitist/ai/update-conversation/${
            chatHistory[0]._id
          }`,
          { ai_input: newUserMessage }
        );
        console.log("Message sent:", response.data);

        // Update the chat history with the AI response after API returns
        setChatHistory((prevHistory) => {
          const updatedHistory = [...prevHistory];
          updatedHistory[updatedHistory.length - 1] = {
            ...updatedHistory[updatedHistory.length - 1],
            ai_response: response.data.ai_response,
          };
          return updatedHistory;
        });

        setMessageSent((prev) => !prev); // Trigger the useEffect for fetching new history
      } catch (error) {
        console.error("Error sending message:", error);
        setLoading(false);
      }
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

      // Set new chat history
      setChatHistory([response.data]); // Start with the new conversation
      setNewChatCreated(true); // Mark that a new chat has been created
      setMessage(""); // Clear input field
    } catch (error) {
      console.error("Error creating new chat:", error);
    }
  };

  const formatAIResponse = (response) => {
    if (!response) return "";

    // Nếu response có dạng liệt kê số thứ tự và tiêu đề in đậm
    if (/\d+\.\s+\*\*/.test(response)) {
      const parts = response.split(/\d+\.\s+\*\*/);
      return parts.map((part, index) => {
        if (!part.trim()) return null;
        const [title, ...content] = part.split("**:");
        const formattedContent = content.join(":").trim();
        return (
          <div key={index} className="mb-2">
            <h6 className="text-success mb-1" style={{ fontSize: "13px" }}>
              {title}
            </h6>
            <p className="mb-0" style={{ fontSize: "13px", color: "#666" }}>
              {formattedContent}
            </p>
          </div>
        );
      }).filter(Boolean);
    }

    // Nếu response có nhiều dòng, mỗi dòng bắt đầu bằng tiêu đề in đậm (Tiêu đề:** ...)
    if (/^.+:\*\*/m.test(response)) {
      // Tách từng dòng
      const lines = response.split(/\n|\r/).filter(line => line.trim() !== "");
      return lines.map((line, idx) => {
        // Nếu có tiêu đề in đậm
        const match = line.match(/^(.+?):\*\*\s*-?\s*(.*)$/);
        if (match) {
          return (
            <div key={idx} className="mb-2">
              <h6 className="text-success mb-1" style={{ fontSize: "14px" }}>
                {match[1]}
              </h6>
              <p className="mb-0" style={{ fontSize: "14px", color: "#666" }}>
                {match[2]}
              </p>
            </div>
          );
        }
        // Nếu không có tiêu đề, hiển thị bình thường
        return (
          <p key={idx} className="mb-0" style={{ fontSize: "14px", color: "#666" }}>
            {line}
          </p>
        );
      });
    }

    // Nếu không phải dạng đặc biệt, trả về nguyên văn
    return <span style={{ whiteSpace: "pre-line", fontSize: "14px" }}>{response}</span>;
  };

  // Thêm hàm xử lý click vào lịch sử chat
  const handleHistoryClick = async (historyId) => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8080/reptitist/ai/get-history/${historyId}`);
      if (response.data) {
        setChatHistory([response.data]); // Cập nhật chatHistory với dữ liệu mới
      }
    } catch (error) {
      console.error("Error fetching chat history:", error);
      setError("Không thể tải lịch sử chat.");
    } finally {
      setLoading(false);
    }
  };

  // Thêm hàm format date an toàn
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return ''; // Kiểm tra date hợp lệ
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  return (
    <>
      {/* <Header /> */}
      <Container
        style={{
          fontFamily: "Poppins, sans-serif",
          height: "90vh",
          paddingTop: "20px",
          paddingBottom: "20px",
          maxHeight: "100vh",
          maxWidth: "1200px",
        }}
      >
        <Row className="h-100 g-0">
          <Col md={8} className="d-flex flex-column">
            {/* Header with Navigation Tabs */}
            <div
              style={{
                padding: "15px 15px 0",
                backgroundColor: "white",
                borderRadius: "15px",
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
                  {/* Nút tạo mới đoạn chat nếu đã có history */}
                  {chatHistory && chatHistory.length > 0 && (
                    <Button
                      variant="outline-success"
                      size="sm"
                      style={{ borderRadius: "20px", fontSize: "13px", padding: "4px 14px" }}
                      onClick={handleCreateChat}
                    >
                      Tạo mới đoạn chat
                    </Button>
                  )}
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
                    Tất cả
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
                    Giao tiếp
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </div>

            {/* Chat Messages Area (Only showing the latest 5 messages) */}
            <div
              style={{
                flex: 1,
                backgroundColor: "white",
                padding: "20px",
                overflowY: "scroll",
                maxHeight: "500px",
                display: "flex",
                flexDirection: "column",
                color: "#666",
              }}
            >
              <div style={{ textAlign: "center", width: "100%" }}>
                <h5 style={{ color: "#666", marginBottom: "8px" }}>
                  Chào mừng đến với ReptiAI!
                </h5>

                
                {chatHistory &&
                  chatHistory.length > 0 &&
                  chatHistory.slice(0, 1)
                    .flatMap(chat => 
                      (chat.ai_input || []).map((input, idx) => ({
                        input,
                        response: (chat.ai_response && chat.ai_response[idx]) || ""
                      }))
                    )
                    .map((msg, idx) => (
                      <div key={idx}>
                        {/* User's message */}
                        <div className="d-flex justify-content-start mb-3">
                          <div
                            style={{
                              maxWidth: "70%",
                              backgroundColor: "#e9ecef",
                              padding: "10px",
                              borderRadius: "15px",
                              fontSize: "14px",
                            }}
                          >
                            {msg.input}
                          </div>
                        </div>
                        {/* AI's response */}
                        {msg.response && (
                          <div className="d-flex justify-content-end mb-3">
                            <div
                              style={{
                                maxWidth: "70%",
                                backgroundColor: "#f8f9fa",
                                padding: "15px",
                                borderRadius: "15px",
                                fontSize: "14px",
                              }}
                            >
                              {formatAIResponse(msg.response)}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                {/* Loading state */}
                {loading && (
                  <div className="d-flex justify-content-center mb-3">
                    <div
                      style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "50%",
                        backgroundColor: "#28a745",
                        animation: "spin 1s infinite linear",
                      }}
                    ></div>
                  </div>
                )}
              </div>
            </div>

            {/* Input Field */}
            <div
              style={{
                padding: "15px",
                backgroundColor: "white",
                borderRadius: "0 0 0 20px",
              }}
            >
              {/* Nếu đã có history thì luôn hiển thị input chat */}
              {chatHistory && chatHistory.length > 0 ? (
                <InputGroup
                  style={{
                    marginBottom: "10px",
                    outline: "none",
                    boxShadow: "none",
                  }}
                >
                  <Form.Control
                    type="text"
                    placeholder="Hỏi ReptiAI về thú cưng của bạn..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
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
              <Card.Body style={{ padding: "0px" }}>
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
            <div style={{ padding: "0 15px 15px", overflowY: "auto" }}>
              <Card
                style={{
                  padding: "0px",
                  border: "none",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                  marginBottom: "12px",
                }}
              >
                <Card.Body style={{ padding: "12px" }}>
                  <h6
                    style={{
                      padding: "0px",
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
                <Card.Body style={{ padding: "0px"}}>
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
                          style={{ height: "30px", borderRadius: "3px" }}
                        />
                        <img
                          src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Download_on_the_App_Store_Badge.svg/2560px-Download_on_the_App_Store_Badge.svg.png"
                          alt="App Store"
                          style={{ height: "30px", borderRadius: "3px" }}
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
               {/* AIChat History Card */}
              <Card
                style={{
                  border: "none",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                  marginTop: "12px",
                }}
              >
                <Card.Body style={{ padding: "0px" }}>
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
                    {chatDataBaseHistory
                      .sort((a, b) => {
                        const dateA = new Date(a.updated_at || a.created_at);
                        const dateB = new Date(b.updated_at || b.created_at);
                        return dateB - dateA;
                      })
                      .slice(0, 5)
                      .map((chat, index) =>
                        chat.ai_input && chat.ai_input.length > 0 ? (
                          <ListGroup.Item
                            key={index}
                            action
                            className="border-bottom py-2 px-0"
                            style={{ backgroundColor: "transparent" }}
                            onClick={() => handleHistoryClick(chat._id)}
                          >
                            <div className="d-flex justify-content-between align-items-center">
                              <div
                                className="text-truncate"
                                style={{ maxWidth: "80%" }}
                              >
                                {chat.ai_input[0]}
                              </div>
                              <small
                                className="text-muted"
                                style={{ fontSize: "10px" }}
                              >
                                {formatDate(chat.updated_at || chat.created_at)}
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
      {/* <Footer /> */}
    </>
  );
};

export default AIChatPage;
