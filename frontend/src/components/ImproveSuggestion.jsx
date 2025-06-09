import React from 'react';
import { Card, Container, Button } from 'react-bootstrap';
// import axios from 'axios';
// import { useParams } from 'react-router-dom';

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

// function ImproveSuggestion({ userReptileId: propUserReptileId }) {
//   const { reptileId } = useParams();
//   const userReptileId = propUserReptileId || reptileId;
//   const [data, setData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     setLoading(true);
//     setError(null);
//     // Nếu có userReptileId thì fetch theo id, không thì fetch tất cả
//     const url = userReptileId
//       ? `http://localhost:8080/reptitist/ai-recommendation/history/${userReptileId}`
//       : `http://localhost:8080/reptitist/ai-recommendation/history`;
//     axios.get(url)
//       .then(res => {
//         setData(res.data);
//         setLoading(false);
//       })
//       .catch(err => {
//         setError('Không thể tải lịch sử gợi ý cải thiện.');
//         setLoading(false);
//       });
//   }, [userReptileId]);

//   if (loading) return <div className="text-center py-4"><Spinner animation="border" variant="success" /></div>;
//   if (error) return <Alert variant="danger">{error}</Alert>;
//   if (!data || data.length === 0) return <Alert variant="info">Chưa có gợi ý cải thiện nào.</Alert>;

function ImproveSuggestion() {
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