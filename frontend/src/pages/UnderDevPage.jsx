import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { Construction, ArrowLeft } from "lucide-react";

const UnderDevPage = () => {
  const styles = {
    container: {
      backgroundColor: "#f8f9fa",
      minHeight: "100vh",
    },
    content: {
      backgroundColor: "white",
      padding: "3rem",
      borderRadius: "1rem",
      boxShadow: "0 0 20px rgba(0, 0, 0, 0.1)",
    },
    constructionIcon: {
      color: "#ffc107",
      animation: "bounce 2s infinite",
    },
    heading: {
      color: "#2c3e50",
      fontWeight: 700,
    },
    paragraph: {
      color: "#6c757d",
      fontSize: "1.1rem",
      lineHeight: 1.6,
    },
    progressContainer: {
      width: "100%",
      maxWidth: "300px",
      margin: "0 auto",
    },
    progressBar: {
      width: "100%",
      height: "8px",
      backgroundColor: "#e9ecef",
      borderRadius: "4px",
      overflow: "hidden",
    },
    progressFill: {
      width: "30%",
      height: "100%",
      backgroundColor: "#007bff",
      borderRadius: "4px",
      animation: "progress 2s ease-in-out infinite",
    },
    backButton: {
      backgroundColor: "#006934",
      padding: "0.75rem 1.5rem",
      fontWeight: 500,
      transition: "all 0.3s ease",
    },
    "@keyframes bounce": {
      "0%, 100%": {
        transform: "translateY(0)",
      },
      "50%": {
        transform: "translateY(-20px)",
      },
    },
    "@keyframes progress": {
      "0%": {
        width: "0%",
      },
      "50%": {
        width: "100%",
      },
      "100%": {
        width: "0%",
      },
    },
    "@media (max-width: 768px)": {
      content: {
        padding: "2rem",
      },
      heading: {
        fontSize: "1.75rem",
      },
      paragraph: {
        fontSize: "1rem",
      },
    },
  };

  return (
    <>
      <Container>
        <Row className="justify-content-center align-items-center min-vh-100">
          <Col xs={12} md={8} lg={6} className="text-center">
            <div style={styles.content}>
              <Construction
                size={80}
                style={styles.constructionIcon}
                className="mb-4"
              />
              <h1 style={styles.heading} className="mb-4">
                Chức năng đang được phát triển
              </h1>
              <p style={styles.paragraph} className="mb-4">
                Chúng tôi đang nỗ lực hoàn thiện tính năng này để mang đến trải
                nghiệm tốt nhất cho bạn. Vui lòng quay lại sau!
              </p>

              <Link to="/">
                <Button
                  variant="primary"
                  style={styles.backButton}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateX(-5px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateX(0)";
                  }}
                >
                  <ArrowLeft size={20} className="me-2" />
                  Quay lại trang chủ
                </Button>
              </Link>
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default UnderDevPage;
