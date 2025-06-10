import React, { useEffect, useState } from "react";
import {
  Card,
  Col,
  Row,
  Badge,
  Button,
  Container,
} from "react-bootstrap";
import axios from "axios";
import { useParams } from "react-router-dom";

function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { year: "numeric", month: "long", day: "numeric" };
  return date.toLocaleDateString("vi-VN", options);
}

const PetBasicInfo = ({ petInfo }) => {
  const [weightHistory, setWeightHistory] = useState([]);
  const [recommendSummary, setRecommendSummary] = useState("");
  const [recommendDetails, setRecommendDetails] = useState({
    behavior: "",
    habitat: "",
    treatment: "",
    nutrition: "",
  });
  const { reptileId } = useParams();

  useEffect(() => {
    if (petInfo && petInfo.weight_history) {
      setWeightHistory(petInfo.weight_history);
      // console.log(">>>>>>>>>>>>>>>>>>>>>>>weightHistory", weightHistory);
    }
  }, [petInfo]);

  // Fetch recommendation_summary từ API
  useEffect(() => {
    if (reptileId) {
      axios
        .get(
          `http://localhost:8080/reptitist/ai/get-all-recommendations/${reptileId}`
        )
        .then((res) => {
          const data = res.data.data;
          if (Array.isArray(data) && data.length > 0) {
            const latest = data[data.length - 1]; // lấy bản gợi ý mới nhất

            setRecommendSummary(latest.recommendation_summary || "");

            const extractFirstSentence = (text) => {
              if (!text) return "";
              try {
                const parsed = JSON.parse(text); // nếu text là object stringified
                if (typeof parsed === "string") {
                  return parsed.split(/[.?!]/)[0] + "."; // lấy câu đầu tiên
                } else {
                  return Object.values(parsed)[0]?.split(/[.?!]/)[0] + ".";
                }
              } catch {
                // nếu không phải JSON
                return text.replace(/^"|"$/g, "").split(/[.?!]/)[0] + ".";
              }
            };

            setRecommendDetails({
              behavior: extractFirstSentence(
                latest.recommendation_detail_behavior
              ),
              habitat: extractFirstSentence(
                latest.recommendation_detail_habitat
              ),
              treatment: extractFirstSentence(
                latest.recommendation_detail_treatment
              ),
              nutrition: extractFirstSentence(
                latest.recommendation_detail_nutrition
              ),
            });
          } else {
            setRecommendSummary("Không có dữ liệu gợi ý sức khỏe");
          }
        })
        .catch((err) => {
          setRecommendSummary("Không thể lấy dữ liệu gợi ý sức khỏe");
        });
    }
  }, [reptileId]);

  // Chart config
  const chartWidth = 420;
  const chartHeight = 200;
  const paddingX = 50; // padding hai bên để label không bị tràn
  const maxWeight = Math.max(...weightHistory.map((w) => w.weight), 300); // lấy max hoặc 300g
  const minWeight = Math.min(...weightHistory.map((w) => w.weight), 0); // lấy min hoặc 0g

  // Tính điểm cho polyline
  const points = weightHistory
    .map((item, idx) => {
      const x =
        paddingX +
        idx * ((chartWidth - 2 * paddingX) / (weightHistory.length - 1 || 1));
      const y =
        chartHeight -
        30 -
        ((item.weight - minWeight) / (maxWeight - minWeight || 1)) *
          (chartHeight - 50); // padding top 20, bottom 30
      return `${x},${y}`;
    })
    .join(" ");

  // Vẽ các điểm tròn
  const circles = weightHistory.map((item, idx) => {
    const x =
      paddingX +
      idx * ((chartWidth - 2 * paddingX) / (weightHistory.length - 1 || 1));
    const y =
      chartHeight -
      30 -
      ((item.weight - minWeight) / (maxWeight - minWeight || 1)) *
        (chartHeight - 50);
    return <circle key={idx} cx={x} cy={y} r="4" fill="#20c997" />;
  });

  // Vẽ label trục X
  const xLabels = weightHistory.map((item, idx) => {
    const x =
      paddingX +
      idx * ((chartWidth - 2 * paddingX) / (weightHistory.length - 1 || 1));
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
    <Container fluid>
      <div className="mb-5">
        <h2 className="text-center fw-bold mb-4" style={{ fontSize: '2rem' }}>
          THÔNG TIN CƠ BẢN
        </h2>
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
                    <span>{petInfo.description}</span>
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
                <svg
                  className="w-100 h-100"
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                >
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
                  {[maxWeight, (maxWeight + minWeight) / 2, minWeight].map(
                    (val, i) => (
                      <text
                        key={i}
                        x="10"
                        y={30 + i * ((chartHeight - 50) / 2)}
                        fontSize="10"
                        fill="#9ca3af"
                      >
                        {Math.round(val)}g
                      </text>
                    )
                  )}
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
                <div
                  className="fw-medium text-success"
                  style={{ fontSize: "16px" }}
                >
                  Gợi ý sức khỏe từ AI
                </div>
                <div
                  className="text-secondary small"
                  style={{
                    whiteSpace: "pre-line",
                    maxHeight: 120,
                    overflowY: "auto",
                  }}
                >
                  {recommendSummary || "Đang tải..."}
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Recommendation Details */}
        <Col xs={12} md={4}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Header className="bg-white border-0 pb-0">
              <div className="d-flex justify-content-between align-items-center">
                <Badge bg="success">Góp ý gần nhất</Badge>
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
              {/* Analysis section */}
              <div
                style={{ marginBottom: "20px" }}
                className="bg-light rounded p-3 small"
              >
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="fw-medium">Hành vi</span>
                </div>
                <p className="text-secondary mb-2">
                  {recommendDetails.behavior || "Đang tải..."}
                </p>
              </div>

              <div
                style={{ marginBottom: "20px" }}
                className="bg-light rounded p-3 small"
              >
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="fw-medium">Môi trường sống</span>
                </div>
                <p className="text-secondary mb-2">
                  {recommendDetails.habitat || "Đang tải..."}
                </p>
              </div>

              <div
                style={{ marginBottom: "20px" }}
                className="bg-light rounded p-3 small"
              >
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="fw-medium">Điều trị</span>
                </div>
                <p className="text-secondary mb-2">
                  {recommendDetails.treatment || "Đang tải..."}
                </p>
              </div>

              <div
                style={{ marginBottom: "20px" }}
                className="bg-light rounded p-3 small"
              >
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="fw-medium">Dinh dưỡng</span>
                </div>
                <p className="text-secondary mb-2">
                  {recommendDetails.nutrition || "Đang tải..."}
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default PetBasicInfo;