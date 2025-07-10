import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { baseUrl } from '../config';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Link, useNavigate } from 'react-router-dom';
import '../css/LibraryDetail.css';

const LibraryExpert = () => {
  const [reptiles, setReptiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReptile, setSelectedReptile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${baseUrl}/reptitist/info/get-all-reptile`)
      .then((res) => {
        setReptiles(res.data.data);
        setLoading(false);
        if (res.data.data.length > 0) setSelectedReptile(res.data.data[0]);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <>
      <Header />
      <div className="page-title-banner">
        <h1>THƯ VIỆN CHUYÊN SÂU</h1>
      </div>
      <div className="container">
        <div className="breadcrumb">
          <Link to="/">Trang chủ</Link> <i className="fas fa-angle-right"></i>{' '}
          <Link to="/LibraryTopic">Thư viện kiến thức</Link> <i className="fas fa-angle-right"></i>{' '}
          <span>Thư viện chuyên sâu</span>
        </div>
      </div>
      <section className="library-section">
        <div className="container">
          <div className="library-content">
            <div className="sidebar">
              <h2 className="sidebar-title" style={{ color: '#0fa958' }}>THƯ VIỆN CHUYÊN SÂU</h2>
              <ul className="sidebar-menu list-unstyled">
                {reptiles.map((reptile) => (
                  <li
                    key={reptile._id}
                    style={{
                      marginBottom: '10px',
                      fontWeight: 'bold',
                      color: '#222',
                      cursor: 'pointer',
                      background: selectedReptile && selectedReptile._id === reptile._id ? '#e6f9f0' : 'transparent',
                      borderRadius: 5,
                      padding: '6px 10px'
                    }}
                    onClick={() => setSelectedReptile(reptile)}
                  >
                    {reptile.common_name}
                  </li>
                ))}
              </ul>
              <button
                className="category-card"
                style={{ width: '100%', background: '#06a13d', color: '#fff', fontWeight: 'bold', border: 'none', borderRadius: 8, padding: '12px 0', marginBottom: 20, cursor: 'pointer' }}
                onClick={() => navigate('/library_expert_topics/create')}
              >
                + Tạo chủ đề
              </button>
            </div>
            <div style={{ flex: 1 }}>
              {loading ? (
                <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src="/loading.gif" alt="Loading" style={{ width: 50, height: 50, marginRight: 12 }} />
                  Đang tải dữ liệu...
                </div>
              ) : selectedReptile ? (
                <div className="category-card" style={{ margin: '0 auto', maxWidth: 400 }}>
                  <div className="card-image">
                    <img
                      src={selectedReptile.image_url || 'https://cdn.pixabay.com/photo/2017/01/31/15/06/dinosaurs-2022584_960_720.png'}
                      alt={selectedReptile.common_name}
                      style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '4px' }}
                    />
                  </div>
                  <div className="card-title" style={{ marginTop: '15px', fontWeight: 'bold', fontSize: '1.1rem', textAlign: 'center' }}>
                    {selectedReptile.common_name}
                  </div>
                  <div style={{ fontSize: '0.95rem', color: '#555', marginTop: 8, textAlign: 'center' }}>
                    {selectedReptile.reptile_description || 'Không có mô tả'}
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: '#888', marginTop: 40 }}>Chọn một loài bò sát ở sidebar để xem chi tiết</div>
              )}
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default LibraryExpert;
