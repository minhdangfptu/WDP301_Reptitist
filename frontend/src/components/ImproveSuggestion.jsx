import React, { useState, useEffect } from 'react';
import { Card, Container, Button } from 'react-bootstrap';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';

// Dummy data mẫu
const dummyData = [
  {
    recommendation_summary: "Tóm tắt: Thằn lằn của bạn cần môi trường ấm, ẩm và chế độ ăn đa dạng.",
    recommendation_detail_habitat: "Nên dùng chuồng kính, có đèn sưởi, độ ẩm 60-70%.",
    recommendation_detail_behavior: "Quan sát hành vi, đảm bảo có chỗ trú ẩn và leo trèo.",
    recommendation_detail_treatment: "Kiểm tra sức khỏe định kỳ, chú ý các dấu hiệu bệnh ngoài da.",
    recommendation_detail_nutrition: "Cung cấp côn trùng, rau xanh, bổ sung vitamin D3 và canxi."
  }
];

function ImproveSuggestion() {
  const { reptileId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recommendations, setRecommendations] = useState({
    behaviour: null,
    habitat: null,
    nutrition: null,
    treatment: null,
    summary: null
  });

  const handleGetRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      // Gọi 5 API cùng lúc
      const [
        behaviourRes,
        habitatRes,
        nutritionRes,
        treatmentRes,
        summaryRes
      ] = await Promise.all([
        axios.get(`http://localhost:8080/reptitist/ai/get-behaviour/${reptileId}`),
        axios.get(`http://localhost:8080/reptitist/ai/get-habitat/${reptileId}`),
        axios.get(`http://localhost:8080/reptitist/ai/get-nutrition/${reptileId}`),
        axios.get(`http://localhost:8080/reptitist/ai/get-treatment/${reptileId}`),
        axios.get(`http://localhost:8080/reptitist/ai/get-summarize/${reptileId}`)
      ]);

      // Cập nhật state với dữ liệu mới
      setRecommendations({
        behaviour: behaviourRes.data,
        habitat: habitatRes.data,
        nutrition: nutritionRes.data,
        treatment: treatmentRes.data,
        summary: summaryRes.data
      });

      // Chuẩn bị dữ liệu để lưu vào database
      const recommendationData = {
        recommendation_summary: summaryRes.data.data,
        recommendation_detail_habitat: habitatRes.data.data,
        recommendation_detail_behavior: behaviourRes.data,
        recommendation_detail_treatment: treatmentRes.data.data,
        recommendation_detail_nutrition: nutritionRes.data.data
      };

      // Lưu vào database
      await axios.post(
        `http://localhost:8080/reptitist/ai/create-recommendation/${reptileId}`,
        recommendationData
      );

      toast.success("Đã lưu gợi ý cải thiện thành công!");
    } catch (err) {
      setError('Không thể tải hoặc lưu dữ liệu gợi ý. Vui lòng thử lại sau.');
      console.error('Error fetching or saving recommendations:', err);
      toast.error("Có lỗi xảy ra khi lưu gợi ý cải thiện!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleGetRecommendations();
  }, [reptileId]);

  const data = dummyData;
  return (
    <Container fluid>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0" style={{ fontSize: '2rem' }}>
          LỊCH SỬ GỢI Ý CẢI THIỆN
        </h2>
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
          onClick={handleGetRecommendations}
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
          Để ReptiAI đề xuất chăm sóc sức khỏe cho thú cưng của bạn
        </Button>
        {/* <Button
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
          // onClick={() => ...}
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
          ReptiAI đề xuất chữa trị
        </Button> */}
      </div>
      {data.map((rec, idx) => (
        <Card className="mb-4" key={idx}>
          <Card.Header className="bg-light fw-bold" style={{ fontSize: '17px', color: '#20c997' }}>
            Gợi ý #{idx + 1}
          </Card.Header>
          <Card.Body>
            <div className="mb-3">
              <strong className="text-success">Tóm tắt:</strong>
              <div>{rec.recommendation_summary}</div>
            </div>
            <div className="mb-3">
              <strong className="text-info">Môi trường sống:</strong>
              <div>{rec.recommendation_detail_habitat}</div>
            </div>
            <div className="mb-3">
              <strong className="text-warning">Hành vi:</strong>
              <div>{rec.recommendation_detail_behavior}</div>
            </div>
            <div className="mb-3">
              <strong className="text-danger">Điều trị:</strong>
              <div>{rec.recommendation_detail_treatment}</div>
            </div>
            <div className="mb-1">
              <strong className="text-primary">Dinh dưỡng:</strong>
              <div>{rec.recommendation_detail_nutrition}</div>
            </div>
          </Card.Body>
        </Card>
      ))}
    </Container>
  );
}

export default ImproveSuggestion;