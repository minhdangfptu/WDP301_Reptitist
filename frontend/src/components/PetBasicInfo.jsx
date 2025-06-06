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
  const [weightHistory, setWeightHistory] = useState([]);

  useEffect(() => {
    if (petInfo && petInfo.weight_history) {
      setWeightHistory(petInfo.weight_history);
      console.log(">>>>>>>>>>>>>>>>>>>>>>>weightHistory",weightHistory);
    }
  }, [petInfo]);

  // Chart config
  const chartWidth = 420;
  const chartHeight = 200;
  const paddingX = 50; // padding hai bên để label không bị tràn
  const maxWeight = Math.max(...weightHistory.map(w => w.weight), 300); // lấy max hoặc 300g
  const minWeight = Math.min(...weightHistory.map(w => w.weight), 0);   // lấy min hoặc 0g

  // Tính điểm cho polyline
  const points = weightHistory.map((item, idx) => {
    const x = paddingX + idx * ((chartWidth - 2 * paddingX) / (weightHistory.length - 1 || 1));
    const y = chartHeight - 30 - ((item.weight - minWeight) / (maxWeight - minWeight || 1)) * (chartHeight - 50); // padding top 20, bottom 30
    return `${x},${y}`;
  }).join(" ");

  // Vẽ các điểm tròn
  const circles = weightHistory.map((item, idx) => {
    const x = paddingX + idx * ((chartWidth - 2 * paddingX) / (weightHistory.length - 1 || 1));
    const y = chartHeight - 30 - ((item.weight - minWeight) / (maxWeight - minWeight || 1)) * (chartHeight - 50);
    return (
      <circle key={idx} cx={x} cy={y} r="4" fill="#20c997" />
    );
  });

  // Vẽ label trục X
  const xLabels = weightHistory.map((item, idx) => {
    const x = paddingX + idx * ((chartWidth - 2 * paddingX) / (weightHistory.length - 1 || 1));
    const date = new Date(item.date);
    const label = `${date.getMonth() + 1}/${date.getFullYear()}`;
    return (
      <text
        key={idx}
        x={x}
        y={chartHeight - 25}
        fontSize="11"
        fill="#9ca3af"
        textAnchor="middle"
      >
        {label}
      </text>
    );
  });

  // Chú thích "Tháng" căn giữa dưới trục X
  const xAxisLabel = (
    <text
      x={chartWidth / 2}
      y={chartHeight - 5}
      fontSize="13"
      fill="#6b7280"
      textAnchor="middle"
      fontWeight="bold"
    >
      Tháng
    </text>
  );

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
                <div style={{ height: "13rem" }} className="mb-3">
                  <svg className="w-100 h-100" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
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
                    {[maxWeight, (maxWeight+minWeight)/2, minWeight].map((val, i) => (
                      <text key={i} x="10" y={30 + i * ((chartHeight-50)/2)} fontSize="10" fill="#9ca3af">
                        {Math.round(val)}g
                      </text>
                    ))}
                    {/* Line chart */}
                    <polyline
                      fill="none"
                      stroke="#20c997"
                      strokeWidth="2"
                      points={points}
                    />
                    {circles}
                    {xLabels}
                    {xAxisLabel}
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
