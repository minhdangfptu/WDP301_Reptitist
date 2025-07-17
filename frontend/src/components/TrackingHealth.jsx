import React from "react";
import { Card, Row, Col, Table, Badge, Spinner, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';

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

  // Prepare chart data for Recharts
  const prepareWeightChartData = () => {
    const weightHistory = petInfo.weight_history || [];
    const weightData = weightHistory.map(item => ({
      date: formatDate(item.date),
      weight: item.weight,
      fullDate: item.date
    })).sort((a, b) => new Date(a.fullDate) - new Date(b.fullDate));

    // Add current weight as latest point if it exists and is different from the last history entry
    if (petInfo.current_weight) {
      const lastHistoryWeight = weightData.length > 0 ? weightData[weightData.length - 1].weight : null;
      if (lastHistoryWeight !== petInfo.current_weight) {
        weightData.push({
          date: formatDate(new Date()),
          weight: petInfo.current_weight,
          fullDate: new Date()
        });
      }
    }

    return weightData;
  };

  // Get the latest weight from either history or current_weight
  const getLatestWeight = () => {
    const weightHistory = petInfo.weight_history || [];
    if (weightHistory.length > 0) {
      // Sort by date and get the latest
      const sortedHistory = weightHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
      return sortedHistory[0].weight;
    }
    return petInfo.current_weight || null;
  };

  const prepareSleepChartData = () => {
    const sleepHistory = petInfo.sleeping_history || [];
    return sleepHistory.map(item => ({
      date: formatDate(item.date),
      hours: item.hours,
      fullDate: item.date
    })).sort((a, b) => new Date(a.fullDate) - new Date(b.fullDate));
  };

  const weightChartData = prepareWeightChartData();
  const sleepChartData = prepareSleepChartData();
  const latestWeight = getLatestWeight();

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
        {/* Biểu đồ cân nặng - UPDATED WITH RECHARTS */}
        <Col xs={12} md={6} lg={5}>
          <Card className="h-100 border-0 shadow-sm mb-3">
            <Card.Header className="bg-white border-0 pb-0">
              <div className="d-flex justify-content-between align-items-center">
                <span className="fw-semibold">Cân nặng hiện tại: <span className="text-success">{latestWeight}g</span></span>
                <Badge bg="success">Cân nặng</Badge>
              </div>
            </Card.Header>
            <Card.Body>
              <div style={{ height: "13rem" }} className="mb-3">
                {weightChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={weightChartData}>
                      <defs>
                        <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#006934" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#006934" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 11, fill: '#9ca3af' }}
                        axisLine={{ stroke: '#e5e7eb' }}
                        tickLine={{ stroke: '#e5e7eb' }}
                      />
                      <YAxis 
                        tick={{ fontSize: 10, fill: '#9ca3af' }}
                        axisLine={{ stroke: '#e5e7eb' }}
                        tickLine={{ stroke: '#e5e7eb' }}
                        label={{ value: 'g', angle: 0, position: 'outside' }}
                      />
                      <Tooltip 
                        formatter={(value) => [`${value}g`, 'Cân nặng']}
                        labelStyle={{ color: '#374151' }}
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="weight" 
                        stroke="#006934" 
                        fillOpacity={1} 
                        fill="url(#weightGradient)"
                        strokeWidth={2}
                        dot={{ fill: '#006934', strokeWidth: 2, r: 3 }}
                        activeDot={{ r: 5, fill: '#006934' }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="d-flex flex-column align-items-center justify-content-center h-100 text-muted">
                    <i className="fas fa-weight fa-3x mb-3" style={{ opacity: 0.3 }}></i>
                    <span>Chưa có dữ liệu cân nặng</span>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        {/* Lịch sử ngủ - UPDATED WITH RECHARTS */}
        <Col xs={12} md={6} lg={7}>
          <Card className="h-100 border-0 shadow-sm mb-3">
            <Card.Header className="bg-white border-0 pb-0 d-flex justify-content-between align-items-center">
              <span className="fw-semibold">Lịch sử giấc ngủ</span>
              <Badge bg="info">Ngủ</Badge>
            </Card.Header>
            <Card.Body>
              {sleepChartData.length > 0 ? (
                <div style={{ height: "200px", marginBottom: "16px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sleepChartData}>
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 11, fill: '#9ca3af' }}
                        axisLine={{ stroke: '#e5e7eb' }}
                        tickLine={{ stroke: '#e5e7eb' }}
                      />
                      <YAxis 
                        tick={{ fontSize: 10, fill: '#9ca3af' }}
                        axisLine={{ stroke: '#e5e7eb' }}
                        tickLine={{ stroke: '#e5e7eb' }}
                        label={{ value: 'Giờ', angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip 
                        formatter={(value) => [`${value}h`, 'Giờ ngủ']}
                        labelStyle={{ color: '#374151' }}
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Bar 
                        dataKey="hours" 
                        fill="#0ea5e9" 
                        radius={[4, 4, 0, 0]}
                        stroke="#0284c7"
                        strokeWidth={1}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="d-flex flex-column align-items-center justify-content-center text-muted" style={{ height: "200px", marginBottom: "16px" }}>
                  <i className="fas fa-moon fa-3x mb-3" style={{ opacity: 0.3 }}></i>
                  <span>Chưa có dữ liệu giấc ngủ</span>
                </div>
              )}
              
              {/* Keep the table for detailed data */}
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