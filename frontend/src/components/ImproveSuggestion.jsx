import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';

const dummyData = {
  recommendation_summary: "Tóm tắt: Thằn lằn của bạn cần môi trường ấm, ẩm và chế độ ăn đa dạng.",
  recommendation_detail_habitat: "Nên dùng chuồng kính, có đèn sưởi, độ ẩm 60-70%.",
  recommendation_detail_behavior: "Quan sát hành vi, đảm bảo có chỗ trú ẩn và leo trèo.",
  recommendation_detail_treatment: "Kiểm tra sức khỏe định kỳ, chú ý các dấu hiệu bệnh ngoài da.",
  recommendation_detail_nutrition: "Cung cấp côn trùng, rau xanh, bổ sung vitamin D3 và canxi."
};

function ImproveSuggestion() {
  const data = dummyData;
  return (
    <Row className="g-3">
      <Col md={12}>
        <Card>
          <Card.Header className="bg-success text-white fw-bold">Tóm tắt</Card.Header>
          <Card.Body>{data.recommendation_summary}</Card.Body>
        </Card>
      </Col>
      <Col md={6}>
        <Card>
          <Card.Header className="bg-info text-white fw-bold">Môi trường sống</Card.Header>
          <Card.Body>{data.recommendation_detail_habitat}</Card.Body>
        </Card>
      </Col>
      <Col md={6}>
        <Card>
          <Card.Header className="bg-warning text-white fw-bold">Hành vi</Card.Header>
          <Card.Body>{data.recommendation_detail_behavior}</Card.Body>
        </Card>
      </Col>
      <Col md={6}>
        <Card>
          <Card.Header className="bg-danger text-white fw-bold">Điều trị</Card.Header>
          <Card.Body>{data.recommendation_detail_treatment}</Card.Body>
        </Card>
      </Col>
      <Col md={6}>
        <Card>
          <Card.Header className="bg-primary text-white fw-bold">Dinh dưỡng</Card.Header>
          <Card.Body>{data.recommendation_detail_nutrition}</Card.Body>
        </Card>
      </Col>
    </Row>
  );
}

export default ImproveSuggestion;