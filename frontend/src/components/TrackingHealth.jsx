import React from "react";
import { Card, Row, Col, Table, Badge, Spinner, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const chartWidth = 420;
const chartHeight = 200;
const paddingX = 50;

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN");
}

export default function TrackingHealth({ petInfo }) {
  const navigate = useNavigate();
  
  if (!petInfo) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="success" />
        <div>Đang tải dữ liệu...</div>
      </div>
    );
  }

  // Chart data
  const weightHistory = petInfo.weight_history || [];
  const maxWeight = Math.max(...weightHistory.map(w => w.weight), petInfo.current_weight || 0, 300);
  const minWeight = Math.min(...weightHistory.map(w => w.weight), 0);
  const points = weightHistory.map((item, idx) => {
    const x = paddingX + idx * ((chartWidth - 2 * paddingX) / (weightHistory.length - 1 || 1));
    const y = chartHeight - 30 - ((item.weight - minWeight) / (maxWeight - minWeight || 1)) * (chartHeight - 50);
    return `${x},${y}`;
  }).join(" ");
  const circles = weightHistory.map((item, idx) => {
    const x = paddingX + idx * ((chartWidth - 2 * paddingX) / (weightHistory.length - 1 || 1));
    const y = chartHeight - 30 - ((item.weight - minWeight) / (maxWeight - minWeight || 1)) * (chartHeight - 50);
    return (
      <circle key={idx} cx={x} cy={y} r="4" fill="#006934" />
    );
  });
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
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0" style={{ fontSize: '2rem' }}>THEO DÕI SỨC KHỎE</h2>
        <div className="d-flex gap-2">
          <Button
            variant="outline-primary"
            size="sm"
            style={{
              borderRadius: "20px",
              fontSize: "13px",
              marginLeft: "16px",
              color: "#006934",
              borderColor: "#006934",
              backgroundColor: "white",
              transition: "all 0.2s"
            }}
            onClick={() => navigate(`/create-health-tracking/${petInfo._id}`)}
            onMouseOver={e => {
              e.target.style.backgroundColor = "#006934";
              e.target.style.color = "#fff";
              e.target.style.borderColor = "#006934";
            }}
            onMouseOut={e => {
              e.target.style.backgroundColor = "white";
              e.target.style.color = "#006934";
              e.target.style.borderColor = "#006934";
            }}
          >
            Thêm dữ liệu theo dõi sức khỏe
          </Button>
          <Button
            variant="outline-danger"
            size="sm"
            style={{
              borderRadius: "20px",
              fontSize: "13px",
              color: "#dc2626",
              borderColor: "#dc2626",
              backgroundColor: "white",
              transition: "all 0.2s"
            }}
            onClick={() => navigate(`/create-treatment/${petInfo._id}`)}
            onMouseOver={e => {
              e.target.style.backgroundColor = "#dc2626";
              e.target.style.color = "#fff";
              e.target.style.borderColor = "#dc2626";
            }}
            onMouseOut={e => {
              e.target.style.backgroundColor = "white";
              e.target.style.color = "#dc2626";
              e.target.style.borderColor = "#dc2626";
            }}
          >
            Thêm dữ liệu điều trị
          </Button>
        </div>
      </div>
      
      <Row className="g-4">
        {/* Biểu đồ cân nặng */}
        <Col xs={12} md={6} lg={5}>
          <Card className="h-100 border-0 shadow-sm mb-3">
            <Card.Header className="bg-white border-0 pb-0">
              <div className="d-flex justify-content-between align-items-center">
                <span className="fw-semibold">Cân nặng hiện tại: <span className="text-success">{petInfo.current_weight}g</span></span>
                <Badge bg="success">Cân nặng</Badge>
              </div>
            </Card.Header>
            <Card.Body>
              <div style={{ height: "13rem" }} className="mb-3">
                <svg className="w-100 h-100" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
                  <defs>
                    <pattern id="grid" width="25" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 25 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                  {[maxWeight, (maxWeight+minWeight)/2, minWeight].map((val, i) => (
                    <text key={i} x="10" y={30 + i * ((chartHeight-50)/2)} fontSize="10" fill="#9ca3af">{Math.round(val)}g</text>
                  ))}
                  <polyline fill="none" stroke="#006934" strokeWidth="2" points={points} />
                  {circles}
                  {xLabels}
                  {xAxisLabel}
                </svg>
              </div>
            </Card.Body>
          </Card>
        </Col>
        {/* Lịch sử ngủ */}
        <Col xs={12} md={6} lg={7}>
          <Card className="h-100 border-0 shadow-sm mb-3">
            <Card.Header className="bg-white border-0 pb-0 d-flex justify-content-between align-items-center">
              <span className="fw-semibold">Lịch sử giấc ngủ</span>
              <Badge bg="info">Ngủ</Badge>
            </Card.Header>
            <Card.Body>
              <Table size="sm" responsive hover>
                <thead>
                  <tr>
                    <th>Ngày</th>
                    <th>Giờ ngủ</th>
                  </tr>
                </thead>
                <tbody>
                  {(petInfo.sleeping_history || []).map((item, idx) => (
                    <tr key={idx}>
                      <td>{formatDate(item.date)}</td>
                      <td>{item.hours}h</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              {petInfo.sleeping_status && petInfo.sleeping_status.length > 0 && (
                <div className="mt-2">
                  <Badge bg="secondary">Giấc ngủ: {petInfo.sleeping_status[0].status}</Badge>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row className="g-4 mt-2">
        {/* Lịch sử điều trị */}
        <Col xs={12}>
          <Card className="h-100 border-0 shadow-sm mb-3">
            <Card.Header className="bg-white border-0 pb-0">
              <span className="fw-semibold">Lịch sử điều trị</span>
              <Badge bg="warning" className="ms-2">Điều trị</Badge>
            </Card.Header>
            <Card.Body>
              <Table size="sm" responsive hover>
                <thead>
                  <tr>
                    <th>Bệnh</th>
                    <th>Ngày điều trị</th>
                    <th>Thuốc</th>
                    <th>Phản hồi</th>
                    <th>Ghi chú</th>
                  </tr>
                </thead>
                <tbody>
                  {(petInfo.treatment_history || []).map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.disease}</td>
                      <td>{formatDate(item.treatment_date)}</td>
                      <td>{item.treatment_medicine}</td>
                      <td>{item.doctor_feedback}</td>
                      <td>{item.note}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row className="g-4 mt-2">
        {/* Lịch sử dinh dưỡng */}
        <Col xs={12}>
          <Card className="h-100 border-0 shadow-sm mb-3">
            <Card.Header className="bg-white border-0 pb-0">
              <span className="fw-semibold">Lịch sử dinh dưỡng</span>
              <Badge bg="success" className="ms-2">Dinh dưỡng</Badge>
            </Card.Header>
            <Card.Body>
              <Table size="sm" responsive hover>
                <thead>
                  <tr>
                    <th>Ngày</th>
                    <th>Thức ăn</th>
                    <th>Số lượng</th>
                    <th>Nhịn ăn</th>
                    <th>Phân</th>
                  </tr>
                </thead>
                <tbody>
                  {(petInfo.nutrition_history || []).map((item, idx) => (
                    <tr key={idx}>
                      <td>{formatDate(item.created_at)}</td>
                      <td>{item.food_items}</td>
                      <td>{item.food_quantity}</td>
                      <td>{item.is_fasting ? "Có" : "Không"}</td>
                      <td>{item.feces_condition}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}