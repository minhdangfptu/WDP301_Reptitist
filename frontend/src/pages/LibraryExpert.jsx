import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { baseUrl } from '../config';

const LibraryExpert = () => {
  const [reptiles, setReptiles] = useState([]);
  const [openIndex, setOpenIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    axios.get(`${baseUrl}/reptitist/info/get-all-reptile`)
      .then((response) => {
        setReptiles(response.data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const toggleReptile = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  if (loading) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <img src="/loading.gif" alt="Loading" style={{ width: 50, height: 50, marginRight: 12 }} />
        Đang tải danh sách bò sát...
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="page-title">
        <div className="container">
          <h1>THƯ VIỆN CHUYÊN SÂU</h1>
        </div>
      </div>
      <div className="container">
        <div className="breadcrumb">
          <Link to="/">Trang chủ</Link> <i className="fas fa-angle-right"></i>{" "}
          <Link to="/LibraryTopic">Thư viện kiến thức</Link> <i className="fas fa-angle-right"></i>{" "}
          <span>Thư viện chuyên sâu</span>
        </div>
      </div>
      <section className="library-section">
        <div className="container">
          <div className="library-content" style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '30px' }}>
            <div className="sidebar">
              <h2 className="sidebar-title">Thư viện chuyên sâu</h2>
              <ul className="sidebar-menu list-unstyled">
                {reptiles.map((reptile, idx) => (
                  <li key={reptile._id} style={{ marginBottom: '10px' }}>
                    <div
                      onClick={() => toggleReptile(idx)}
                      style={{
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <span>{reptile.common_name}</span>
                      <span
                        style={{
                          transform: openIndex === idx ? 'rotate(90deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s ease',
                          display: 'inline-block',
                        }}
                      >
                        ▶
                      </span>
                    </div>
                    {openIndex === idx && (
                      <ul style={{ paddingLeft: '15px', marginTop: '5px' }}>
                        <li>
                          <Link to={`/libraryExpertDetail/${reptile._id}`}>
                            {reptile.reptile_description?.slice(0, 60) || 'Không có mô tả'}
                          </Link>
                        </li>
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
              <div style={{ marginTop: '20px' }}>
                <button
                  onClick={() => navigate('/library_expert_topics/create')}
                  style={{
                    width: '100%',
                    padding: '8px 16px',
                    backgroundColor: '#06a13d',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    transition: 'background-color 0.2s ease',
                  }}
                >
                  + Tạo chủ đề
                </button>
              </div>
            </div>
            {/* Content Grid for Reptiles */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              <div
                className="content-grid"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '20px',
                }}
              >
                {reptiles.map((reptile) => (
                  <div
                    className="category-card"
                    key={reptile._id}
                    style={{
                      width: '100%',
                      border: '1px solid #ccc',
                      borderRadius: '8px',
                      padding: '15px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      transition: 'transform 0.2s ease',
                    }}
                  >
                    <Link to={`/libraryExpertDetail/${reptile._id}`}>
                      <div className="card-image" style={{ cursor: 'pointer' }}>
                        <img
                          src={reptile.image_url || 'https://cdn.pixabay.com/photo/2017/01/31/15/06/dinosaurs-2022584_960_720.png'}
                          alt={reptile.common_name}
                          style={{
                            width: '100%',
                            height: '200px',
                            objectFit: 'cover',
                            borderRadius: '4px',  
                          }}
                        />
                      </div>
                    </Link>
                    <div className="card-title" style={{ marginTop: '15px', fontWeight: 'bold', fontSize: '1.1rem' }}>
                      {reptile.common_name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default LibraryExpert;
