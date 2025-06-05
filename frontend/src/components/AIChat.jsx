"use client"

import { useState } from "react"
import { Container, Row, Col, Card, Button, Form, InputGroup, Nav, Badge } from "react-bootstrap"

const AIChat = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState("chat")
  const [message, setMessage] = useState("")
  const [useReptileData, setUseReptileData] = useState(true)

  const tools = [
    { icon: "bi-journal-text", title: "Hướng dẫn", subtitle: "chăm sóc", color: "#28a745" },
    { icon: "bi-calendar-check", title: "Lập kế hoạch", subtitle: "dinh dưỡng", color: "#28a745" },
    { icon: "bi-gear", title: "Cấu hình", subtitle: "chuồng", color: "#6c757d" },
    { icon: "bi-graph-up", title: "Kiểm tra", subtitle: "sức khỏe", color: "#28a745" },
    { icon: "bi-people", title: "Tìm kiếm", subtitle: "chuyên gia", color: "#28a745" },
    { icon: "bi-heart", title: "Lên lịch", subtitle: "vận động", color: "#28a745" },
  ]

  const handleSendMessage = () => {
    if (message.trim()) {
      console.log("Sending message:", message)
      setMessage("")
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <Container fluid className="p-0" style={{ fontFamily: "Arial, sans-serif", height: "100vh" }}>
      <Row className="h-100 g-0">
        {/* Left Panel - Chat Interface */}
        <Col md={8} className="d-flex flex-column">
          {/* Header with Navigation Tabs */}
          <div style={{ padding: "15px 15px 0", backgroundColor: "white", borderRadius: "15px 0 0 0" }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3 style={{ margin: 0, fontSize: "1.5rem", fontWeight: "bold", color: "#333" }}>
                Welcome{" "}
                <span style={{ fontSize: "1.2rem" }} role="img" aria-label="lizard">
                  🦎
                </span>
              </h3>
              <div style={{ display: "flex", gap: "8px" }}>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  style={{ border: "none", background: "none", padding: "4px" }}
                >
                  <i className="bi bi-arrows-fullscreen"></i>
                </Button>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  style={{ border: "none", background: "none", padding: "4px" }}
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
                    borderColor: activeTab === "chat" ? "#28a745" : "transparent",
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
                    borderColor: activeTab === "schedule" ? "#28a745" : "transparent",
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
                    borderColor: activeTab === "docs" ? "#28a745" : "transparent",
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
                    borderColor: activeTab === "all" ? "#28a745" : "transparent",
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
              <i className="bi bi-chat-dots" style={{ fontSize: "48px", color: "#dee2e6", marginBottom: "16px" }}></i>
              <h5 style={{ color: "#666", marginBottom: "8px" }}>Chào mừng đến với ReptiAI!</h5>
              <p style={{ fontSize: "14px", color: "#999" }}>Hãy bắt đầu cuộc trò chuyện về thú cưng bò sát của bạn</p>
            </div>
          </div>

          {/* Chat Input */}
          <div style={{ padding: "15px", backgroundColor: "white" }}>
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

            {/* Toggle Switch */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px" }}>
              <span style={{ color: "#666" }}>Sử dụng dữ liệu của bò sát</span>
              <Form.Check
                type="switch"
                id="reptile-data-switch"
                checked={useReptileData}
                onChange={(e) => setUseReptileData(e.target.checked)}
                style={{ marginLeft: "10px" }}
              />
            </div>
          </div>
        </Col>

        {/* Right Panel - Tools and Features */}
        <Col md={4} className="d-flex flex-column" style={{ backgroundColor: "#f8f9fa", borderRadius: "0 15px 15px 0" }}>
          {/* Tools Section */}
          <Card style={{ border: "none", boxShadow: "0 2px 10px rgba(0,0,0,0.1)", margin: "15px" }}>
            <Card.Body style={{ padding: "12px" }}>
              <h6 style={{ color: "#28a745", fontWeight: "600", marginBottom: "12px", fontSize: "14px" }}>Công cụ</h6>
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
                        e.currentTarget.style.backgroundColor = "#f8f9fa"
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent"
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
                        <i className={tool.icon} style={{ color: "white", fontSize: "14px" }}></i>
                      </div>
                      <div style={{ fontSize: "9px", lineHeight: "1.1", color: "#333" }}>
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
            {/* Image/Video Section */}
            <Card style={{ border: "none", boxShadow: "0 2px 10px rgba(0,0,0,0.1)", marginBottom: "12px" }}>
              <Card.Body style={{ padding: "12px" }}>
                <h6 style={{ color: "#28a745", fontWeight: "600", marginBottom: "10px", fontSize: "13px" }}>
                  Hình ảnh - Video
                </h6>
                <Row>
                  <Col xs={6}>
                    <div style={{ fontSize: "10px", color: "#666", marginBottom: "8px" }}>
                      Công cụ tạo hình ảnh
                      <br />
                      Hỗ trợ 10+ model
                    </div>
                    <div style={{ display: "flex", gap: "3px", alignItems: "center" }}>
                      <div
                        style={{
                          width: "16px",
                          height: "16px",
                          borderRadius: "50%",
                          background: "linear-gradient(45deg, #ff6b6b, #4ecdc4)",
                        }}
                      ></div>
                      <div
                        style={{
                          width: "16px",
                          height: "16px",
                          borderRadius: "50%",
                          background: "linear-gradient(45deg, #45b7d1, #96ceb4)",
                        }}
                      ></div>
                      <span style={{ fontSize: "12px", fontWeight: "bold", color: "#8e44ad", marginLeft: "3px" }}>
                        S.
                      </span>
                    </div>
                  </Col>
                  <Col xs={6}>
                    <div style={{ fontSize: "10px", color: "#666", marginBottom: "8px" }}>
                      Hướng dẫn video
                      <br />
                      Model pro
                    </div>
                    <div style={{ display: "flex", gap: "2px", flexWrap: "wrap" }}>
                      <Badge bg="primary" style={{ fontSize: "8px", padding: "2px 4px" }}>
                        S.
                      </Badge>
                      <Badge bg="info" style={{ fontSize: "8px", padding: "2px 4px" }}>
                        <i className="bi bi-chat"></i>
                      </Badge>
                      <Badge bg="danger" style={{ fontSize: "8px", padding: "2px 4px" }}>
                        R
                      </Badge>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Contact Doctor Section */}
            <Card style={{ border: "none", boxShadow: "0 2px 10px rgba(0,0,0,0.1)", marginBottom: "12px" }}>
              <Card.Body style={{ padding: "12px" }}>
                <h6 style={{ color: "#28a745", fontWeight: "600", marginBottom: "6px", fontSize: "13px" }}>
                  Liên hệ Bác sĩ
                </h6>
                <p style={{ fontSize: "10px", color: "#666", marginBottom: "8px" }}>Liên hệ khẩn cấp</p>
                <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                  <Badge bg="primary" style={{ fontSize: "8px", padding: "3px 6px" }}>
                    S.
                  </Badge>
                  <Badge bg="info" style={{ fontSize: "8px", padding: "3px 6px" }}>
                    <i className="bi bi-chat"></i>
                  </Badge>
                  <Badge bg="danger" style={{ fontSize: "8px", padding: "3px 6px" }}>
                    <i className="bi bi-telephone"></i>
                  </Badge>
                </div>
              </Card.Body>
            </Card>

            {/* App Download Section */}
            <Card style={{ border: "none", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
              <Card.Body style={{ padding: "12px" }}>
                <h6 style={{ color: "#28a745", fontWeight: "600", marginBottom: "6px", fontSize: "13px" }}>
                  Tải ứng dụng
                </h6>
                <p style={{ fontSize: "10px", color: "#666", marginBottom: "8px" }}>Trải nghiệm trên mobile</p>
                <Row>
                  <Col xs={8}>
                    <div style={{ display: "flex", gap: "4px" }}>
                      <img
                        src="/placeholder.svg?height=20&width=60"
                        alt="Google Play"
                        style={{ height: "20px", borderRadius: "3px" }}
                      />
                      <img
                        src="/placeholder.svg?height=20&width=60"
                        alt="App Store"
                        style={{ height: "20px", borderRadius: "3px" }}
                      />
                    </div>
                  </Col>
                  <Col xs={4}>
                    <div
                      style={{
                        width: "30px",
                        height: "30px",
                        backgroundColor: "#000",
                        borderRadius: "4px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "6px",
                        color: "white",
                      }}
                    >
                      QR
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </div>
        </Col>
      </Row>
    </Container>
  )
}

export default AIChat