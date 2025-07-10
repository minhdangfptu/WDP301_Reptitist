import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { baseUrl } from '../config';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../css/LibraryDetail.css';

const LibraryExpertDetail = () => {
  const { reptileId } = useParams();
  const [reptile, setReptile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${baseUrl}/reptitist/info/get-all-reptile`)
      .then(res => {
        const found = res.data.data.find(r => r._id === reptileId);
        setReptile(found);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [reptileId]);

  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <img src="/loading.gif" alt="Loading" style={{ width: 50, height: 50, marginRight: 12 }} />
      Đang tải dữ liệu...
    </div>
  );
  if (!reptile) return <div style={{ textAlign: 'center', margin: 40 }}>Không tìm thấy thông tin bò sát.</div>;

  return (
    <>
      <Header />
      <div className="page-title-banner">
        <h1>{reptile.common_name}</h1>
      </div>
      <div className="container">
        <div className="breadcrumb">
          <Link to="/">Trang chủ</Link> <i className="fas fa-angle-right"></i>{' '}
          <Link to="/LibraryExpert">Thư viện chuyên sâu</Link> <i className="fas fa-angle-right"></i>{' '}
          <span>{reptile.common_name}</span>
        </div>
        <div className="library-content" style={{ gap: 40 }}>
          <div className="main-content" style={{ flex: 1 }}>
            <div className="category-card" style={{ padding: 32, textAlign: 'center' }}>
              <div className="card-image" style={{ marginBottom: 24 }}>
                <img
                  src={reptile.image_url || 'https://cdn.pixabay.com/photo/2017/01/31/15/06/dinosaurs-2022584_960_720.png'}
                  alt={reptile.common_name}
                  style={{ width: 320, height: 220, objectFit: 'cover', borderRadius: 8, margin: '0 auto' }}
                />
              </div>
              <h2 style={{ fontWeight: 700, marginBottom: 16 }}>{reptile.common_name}</h2>
              <p><strong>Mô tả:</strong> {reptile.reptile_description || 'Không có mô tả.'}</p>
              <p><strong>Tuổi thọ:</strong> {reptile.lifespan_years ? `${reptile.lifespan_years} năm` : 'Không rõ'}</p>
              <p><strong>Nhà ở tự nhiên:</strong> {reptile.natural_habitat || 'Không rõ'}</p>
              <p><strong>Chế độ ăn:</strong> {reptile.diet || 'Không rõ'}</p>
              <p><strong>Thức ăn được khuyến nghị:</strong> {reptile.recommended_foods?.join(', ') || 'Không rõ'}</p>
              <p><strong>Bệnh thường gặp:</strong> {reptile.disease?.day || 'Không rõ'}</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default LibraryExpertDetail; 