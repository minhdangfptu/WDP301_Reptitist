import React, { useEffect, useState } from "react";
import {
  Card,
  Col,
  Row,
  Badge,
  ProgressBar,
  Container,
  Button,
} from "react-bootstrap";
import axios from "axios";
import { useParams } from "react-router-dom";

function formatDate(dateString) {
  const date = new Date(dateString); // 
  const options = { year: 'numeric', month: 'long', day: 'numeric' }; 
  return date.toLocaleDateString('vi-VN', options); 
}
const PetBasicInfo = ({ petInfo }) => {
  
  // console.log("???????????",petInfo);
  return (
    <>
      <Container fluid>
        <div className="mb-5">
          <h2 className="text-center fw-bold mb-4">THÔNG TIN CƠ BẢN</h2>
          <Row className="g-4">
            {/* Profile Picture */}
            <Col xs={12} md={4} className="text-center">
              <Card className="border-0 shadow-sm">
                <Card.Img
                  variant="top"
                  src={
                    petInfo.user_reptile_imageurl || "/default-pet-image.jpg"
                  } // Fallback image
                  alt={petInfo.reptile_name || "Pet Image"} // Fallback alt text
                  style={{ objectFit: "cover", height: "200px" }}
                />
              </Card>
            </Col>
            {/* Basic Information Table */}
            <Col xs={12} md={8}>
              <Card className="border-0 shadow-sm" style={{ height: "100%" }}>
                <Card.Body>
                  <Row>
                    <Col xs={12} md={6}>
                      <div className="mb-3 d-flex justify-content-between">
                        <span className="fw-medium">Tên bò sát</span>
                        <span>{petInfo.reptile_name}</span>
                      </div>
                      <div className="mb-3 d-flex justify-content-between">
                        <span className="fw-medium">Giống loài</span>
                        <span>{petInfo.reptile_species}</span>
                      </div>
                      <div className="mb-3 d-flex justify-content-between">
                        <span className="fw-medium">Tên thường gọi</span>
                        <span>{petInfo.name} </span>
                      </div>
                    </Col>
                    <Col xs={12} md={6}>
                      <div className="mb-3 d-flex justify-content-between align-items-center">
                        <span className="fw-medium">Tuổi</span>
                        <div className="d-flex align-items-center">
                          <span>{petInfo.age} tháng</span>
                        </div>
                      </div>
                      <div className="mb-3 d-flex justify-content-between">
                        <span className="fw-medium">Theo dõi từ</span>
                        <span>{formatDate(petInfo.follow_since)}</span>
                      </div>
                      <div className="mb-3 d-flex justify-content-between">
                        <span className="fw-medium">Cân nặng hiện tại</span>
                        <span>{petInfo.current_weight} gam</span>
                      </div>
                      
                    </Col>
                    <div className="mb-3 d-flex justify-content-between">
                      <span className="fw-medium">Miêu tả</span>
                      <span>
                        {petInfo.description }
                      </span>
                    </div>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>

        <Row className="g-4">
          {/* Weight Chart */}
          <Col xs={12} md={4}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Header className="bg-white border-0 pb-0">
                <div className="d-flex justify-content-between align-items-center">
                  <Badge bg="success">Tháng</Badge>
                  <Button
                    variant="link"
                    size="sm"
                    className="text-secondary p-0"
                  >
                    <i className="bi bi-three-dots"></i>
                  </Button>
                </div>
                <div className="text-center small fw-medium">Năm 2024</div>
              </Card.Header>
              <Card.Body>
                <div style={{ height: "10rem" }} className="mb-3">
                  <svg className="w-100 h-100" viewBox="0 0 300 160">
                    {/* Grid lines */}
                    <defs>
                      <pattern
                        id="grid"
                        width="25"
                        height="20"
                        patternUnits="userSpaceOnUse"
                      >
                        <path
                          d="M 25 0 L 0 0 0 20"
                          fill="none"
                          stroke="#e5e7eb"
                          strokeWidth="0.5"
                        />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />

                    {/* Y-axis labels */}
                    <text x="10" y="20" fontSize="8" fill="#9ca3af">
                      300g
                    </text>
                    <text x="10" y="40" fontSize="8" fill="#9ca3af">
                      250g
                    </text>
                    <text x="10" y="60" fontSize="8" fill="#9ca3af">
                      200g
                    </text>
                    <text x="10" y="80" fontSize="8" fill="#9ca3af">
                      150g
                    </text>
                    <text x="10" y="100" fontSize="8" fill="#9ca3af">
                      100g
                    </text>
                    <text x="10" y="120" fontSize="8" fill="#9ca3af">
                      50g
                    </text>
                    <text x="15" y="140" fontSize="8" fill="#9ca3af">
                      0
                    </text>

                    {/* Line chart */}
                    <polyline
                      fill="none"
                      stroke="#20c997"
                      strokeWidth="2"
                      points="30,120 55,100 80,90 105,95 130,85 155,80 180,90 205,85 230,75 255,80 280,85 300,80"
                    />

                    {/* Data points */}
                    <circle cx="180" cy="90" r="4" fill="#20c997" />
                    <circle
                      cx="180"
                      cy="90"
                      r="8"
                      fill="none"
                      stroke="#20c997"
                      strokeWidth="1"
                      opacity="0.5"
                    />

                    {/* Current value label */}
                    <rect
                      x="165"
                      y="70"
                      width="30"
                      height="15"
                      fill="black"
                      rx="2"
                    />
                    <text
                      x="180"
                      y="80"
                      fontSize="8"
                      fill="white"
                      textAnchor="middle"
                    >
                      70g
                    </text>

                    {/* X-axis labels */}
                    {[
                      "T1",
                      "T2",
                      "T3",
                      "T4",
                      "T5",
                      "T6",
                      "T7",
                      "T8",
                      "T9",
                      "T10",
                      "T11",
                      "T12",
                    ].map((month, index) => (
                      <text
                        key={month}
                        x={30 + index * 22.5}
                        y="155"
                        fontSize="8"
                        fill="#9ca3af"
                        textAnchor="middle"
                      >
                        {month}
                      </text>
                    ))}
                  </svg>
                </div>
                <div className="d-flex align-items-center">
                  <div
                    className="rounded-circle bg-success me-2"
                    style={{ width: "0.75rem", height: "0.75rem" }}
                  ></div>
                  <span className="small">Cân nặng</span>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Health Status */}
          <Col xs={12} md={4}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Header className="bg-white border-0 pb-0">
                <div className="d-flex justify-content-between align-items-center">
                  <Badge bg="primary">Sức khỏe</Badge>
                  <Button
                    variant="link"
                    size="sm"
                    className="text-secondary p-0"
                  >
                    <i className="bi bi-three-dots"></i>
                  </Button>
                </div>
              </Card.Header>
              <Card.Body className="d-flex flex-column align-items-center justify-content-center">
                <div className="text-center mb-3">
                  <div className="display-5 fw-light text-secondary">65</div>
                  <div className="d-flex align-items-center justify-content-center">
                    <i className="bi bi-arrow-down text-danger me-1"></i>
                    <span className="text-danger small">8%</span>
                  </div>
                </div>
                <div className="text-center mt-3">
                  <div className="small">
                    Bệnh lý: <span className="fw-medium">Không có</span>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Sleep Chart */}
          <Col xs={12} md={4}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Header className="bg-white border-0 pb-0">
                <div className="d-flex justify-content-between align-items-center">
                  <Badge bg="success">Tháng</Badge>
                  <Button
                    variant="link"
                    size="sm"
                    className="text-secondary p-0"
                  >
                    <i className="bi bi-three-dots"></i>
                  </Button>
                </div>
              </Card.Header>
              <Card.Body>
                <div style={{ height: "8rem" }} className="mb-3">
                  <svg className="w-100 h-100" viewBox="0 0 200 120">
                    {/* Y-axis labels */}
                    <text x="10" y="15" fontSize="8" fill="#9ca3af">
                      3h
                    </text>
                    <text x="10" y="35" fontSize="8" fill="#9ca3af">
                      2h
                    </text>
                    <text x="10" y="55" fontSize="8" fill="#9ca3af">
                      1h
                    </text>
                    <text x="10" y="75" fontSize="8" fill="#9ca3af">
                      30p
                    </text>
                    <text x="10" y="95" fontSize="8" fill="#9ca3af">
                      20p
                    </text>

                    {/* Bar chart - Yesterday (gray bars) */}
                    <rect x="30" y="60" width="8" height="40" fill="#d1d5db" />
                    <rect x="60" y="40" width="8" height="60" fill="#d1d5db" />
                    <rect x="90" y="50" width="8" height="50" fill="#d1d5db" />
                    <rect x="120" y="30" width="8" height="70" fill="#d1d5db" />

                    {/* Bar chart - Today (green bars) */}
                    <rect x="40" y="50" width="8" height="50" fill="#20c997" />
                    <rect x="70" y="20" width="8" height="80" fill="#20c997" />
                    <rect x="100" y="40" width="8" height="60" fill="#20c997" />
                    <rect x="130" y="25" width="8" height="75" fill="#20c997" />
                  </svg>
                </div>

                {/* Time labels */}
                <Row className="text-center small text-secondary mb-3">
                  <Col xs={3}>Sáng</Col>
                  <Col xs={3}>Trưa</Col>
                  <Col xs={3}>Chiều</Col>
                  <Col xs={3}>Tối</Col>
                </Row>

                {/* Analysis section */}
                <div className="bg-light rounded p-3 small">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-medium">Phân hồi</span>
                    <div className="d-flex align-items-center">
                      <i className="bi bi-arrow-down text-danger me-1"></i>
                      <span className="text-danger">8%</span>
                    </div>
                  </div>
                  <p className="text-secondary mb-2">
                    Hoạt động ít hơn rõ rệt, cần thiết phải vận động nhiều hơn
                  </p>
                  <div className="d-flex align-items-center">
                    <div className="d-flex align-items-center me-3">
                      <div
                        className="rounded-circle bg-secondary me-1"
                        style={{ width: "0.5rem", height: "0.5rem" }}
                      ></div>
                      <span>Hôm qua</span>
                    </div>
                    <div className="d-flex align-items-center">
                      <div
                        className="rounded-circle bg-success me-1"
                        style={{ width: "0.5rem", height: "0.5rem" }}
                      ></div>
                      <span>Hôm nay</span>
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default PetBasicInfo;
