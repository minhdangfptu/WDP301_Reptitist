import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { baseUrl } from '../config';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';

const LibraryExpert = () => {
  const [reptiles, setReptiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${baseUrl}/reptitist/info/get-all-reptile`)
      .then((res) => {
        setReptiles(res.data.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Lỗi khi tải dữ liệu bò sát:', err);
        setLoading(false);
      });
  }, []);

  return (
    <>
      <Header />

      <div className="container" style={{ paddingTop: '30px' }}>
        {/* Breadcrumbs */}
        <div className="breadcrumb" style={{ marginBottom: '20px', fontSize: '15px' }}>
          <Link to="/">Trang chủ</Link> <i className="fas fa-angle-right" style={{ margin: '0 8px' }}></i>
          <Link to="/LibraryTopic">Thư viện kiến thức</Link> <i className="fas fa-angle-right" style={{ margin: '0 8px' }}></i>
          <span>Thư viện bò sát chuyên sâu</span>
        </div>

        {/* Tiêu đề */}
        <h1 style={{ marginBottom: '30px', fontWeight: 'bold' }}>Thư viện bò sát chuyên sâu</h1>

        {/* Loading */}
        {loading ? (
          <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <img src="/lgifoading." alt="Loading" style={{ width: 50, height: 50, marginRight: 12 }} />
            Đang tải dữ liệu bò sát...
          </div>
        ) : reptiles.length === 0 ? (
          <p>Không có dữ liệu bò sát.</p>
        ) : (
          <div
            className="content-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '20px',
              marginBottom: '50px',
            }}
          >
            {reptiles.map((reptile) => (
              <div
                key={reptile._id}
                className="reptile-card"
                style={{
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                  padding: '15px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  transition: 'transform 0.2s ease',
                  backgroundColor: '#fff',
                }}
              >
                <img
                  src={
                    reptile.image_url ||
                    'https://cdn.pixabay.com/photo/2017/01/31/15/06/dinosaurs-2022584_960_720.png'
                  }
                  alt={reptile.common_name}
                  style={{
                    width: '100%',
                    height: '200px',
                    objectFit: 'cover',
                    borderRadius: '4px',
                  }}
                />
                <h3 style={{ marginTop: '15px', fontWeight: 'bold' }}>{reptile.common_name}</h3>
                <p style={{ margin: '5px 0' }}><strong>Tuổi thọ:</strong> {reptile.lifespan_years} năm</p>
                <p style={{ margin: '5px 0' }}><strong>Chế độ ăn:</strong> {reptile.diet}</p>
                <p style={{ margin: '5px 0' }}>
                  <strong>Thức ăn khuyên dùng:</strong> {reptile.recommended_foods?.join(', ') || 'Không rõ'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </>
  );
};

export default LibraryExpert;
