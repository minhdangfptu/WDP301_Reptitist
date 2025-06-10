import React, { useState, useEffect } from 'react';
import { Card, Container, Button, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify'  ;

// Hàm format ngày giờ
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

// Hàm xử lý hiển thị từng trường gợi ý (bản mới, có số thứ tự và tiêu đề nhỏ in đậm)
const renderSection = (title, value, color) => {
  if (
    !value ||
    value === '{}' ||
    (typeof value === 'object' && Object.keys(value).length === 0)
  ) {
    return (
      <div className="mb-3">
        <strong className={`text-${color}`}>{title}:</strong>
        <div className="text-muted">Không có thông tin</div>
      </div>
    );
  }

  if (typeof value === 'object') {
    return (
      <div className="mb-3">
        <strong className={`text-${color}`}>{title}:</strong>
        <ul className="mb-0 ps-3">
          {Object.entries(value).map(([k, v], idx) => (
            <li key={idx}><b>{k}:</b> {v}</li>
          ))}
        </ul>
      </div>
    );
  }

  let displayValue = value;
  try {
    const parsed = JSON.parse(value);
    if (typeof parsed === 'object' && Object.keys(parsed).length === 0) {
      return (
        <div className="mb-3">
          <strong className={`text-${color}`}>{title}:</strong>
          <div className="text-muted">Không có thông tin</div>
        </div>
      );
    }
    if (typeof parsed === 'object') {
      return (
        <div className="mb-3">
          <strong className={`text-${color}`}>{title}:</strong>
          <ul className="mb-0 ps-3">
            {Object.entries(parsed).map(([k, v], idx) => (
              <li key={idx}><b>{k}:</b> {v}</li>
            ))}
          </ul>
        </div>
      );
    }
    displayValue = parsed;
  } catch (e) {}

  const lines = displayValue.split('\n').map(line => line.trim()).filter(Boolean);

  return (
    <div className="mb-3">
      <strong className={`text-${color}`}>{title}:</strong>
      {lines.length > 1 ? (
        <ul className="mb-0 ps-3">
          {lines.map((line, idx) => {
            // Regex: số thứ tự + dấu chấm + tiêu đề + dấu hai chấm + nội dung
            const match = line.match(/^([0-9]+\.\s*[^:]+:)(.*)$/);
            if (match) {
              return (
                <li key={idx}>
                  <b>{match[1]}</b>{match[2]}
                </li>
              );
            }
            return <li key={idx}>{line}</li>;
          })}
        </ul>
      ) : (
        <div style={{ whiteSpace: 'pre-line' }}>{displayValue}</div>
      )}
    </div>
  );
};

function ImproveSuggestion() {
  const { reptileId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [sortDesc, setSortDesc] = useState(true); // true: mới nhất lên trước

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`http://localhost:8080/reptitist/ai/get-all-recommendations/${reptileId}`);
      setRecommendations(response.data.data);
      toast.success("Đã tải gợi ý cải thiện thành công!");
    } catch (err) {
      setError('Không thể tải dữ liệu gợi ý. Vui lòng thử lại sau.');
      console.error('Error fetching recommendations:', err);
      toast.error("Có lỗi xảy ra khi tải gợi ý cải thiện!");
    } finally {
      setLoading(false);
    }
  };

  const handleGetNewRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`http://localhost:8080/reptitist/ai/get-all-recommendations/${reptileId}`);
      setRecommendations([response.data.data, ...recommendations]);
      toast.success("Đã tạo gợi ý cải thiện mới thành công!");
    } catch (err) {
      setError('Không thể tạo gợi ý mới. Vui lòng thử lại sau.');
      console.error('Error creating new recommendations:', err);
      toast.error("Có lỗi xảy ra khi tạo gợi ý cải thiện mới!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [reptileId]);

  // Sắp xếp recommendations theo thời gian
  const sortedRecommendations = [...recommendations].sort((a, b) => {
    if (!a.createdAt || !b.createdAt) return 0;
    return sortDesc
      ? new Date(b.createdAt) - new Date(a.createdAt)
      : new Date(a.createdAt) - new Date(b.createdAt);
  });

  if (loading) {
    return (
      <Container fluid className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
        <img src={'/loading.gif'} alt="Loading" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid>
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </Container>
    );
  }

  return (
    <Container fluid>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0" style={{ fontSize: '2rem' }}>
          LỊCH SỬ GỢI Ý CẢI THIỆN
        </h2>
        <div>
          <Button
            variant="outline-secondary"
            size="sm"
            style={{ marginRight: 8, borderRadius: "50px" }}
            onClick={() => setSortDesc(!sortDesc)}
          >
            {sortDesc ? "Mới nhất" : "Cũ nhất"}
          </Button>
          <Button
            variant="outline-primary"
            size="sm"
            style={{
              borderRadius: "50px",
              
              fontSize: "13px",
              marginLeft: "8px",
              color: "#006934",
              borderColor: "#006934",
              backgroundColor: "white",
              transition: "all 0.2s"
            }}
            onClick={handleGetNewRecommendations}
            disabled={loading}
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
            {loading ? 'Đang xử lý...' : 'Để ReptiAI đề xuất chăm sóc sức khỏe cho thú cưng của bạn'}
          </Button>
        </div>
      </div>

      {sortedRecommendations.length === 0 ? (
        <div className="text-center text-muted my-5">
          Chưa có gợi ý cải thiện nào. Hãy nhấn nút bên trên để tạo gợi ý mới.
        </div>
      ) : (
        sortedRecommendations.map((rec, idx) => (
          <Card className="mb-4" key={rec._id}>
            <Card.Header className="bg-light fw-bold" style={{ fontSize: '17px', color: '#20c997' }}>
              Gợi ý #{sortedRecommendations.length - idx} ({formatDate(rec.createdAt)})
            </Card.Header>
            <Card.Body>
              {renderSection('Tóm tắt', rec.recommendation_summary, 'success')}
              {renderSection('Môi trường sống', rec.recommendation_detail_habitat, 'info')}
              {renderSection('Hành vi', rec.recommendation_detail_behavior, 'warning')}
              {renderSection('Điều trị', rec.recommendation_detail_treatment, 'danger')}
              {renderSection('Dinh dưỡng', rec.recommendation_detail_nutrition, 'primary')}
            </Card.Body>
          </Card>
        ))
      )}
    </Container>
  );
}

export default ImproveSuggestion;