import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { baseUrl } from '../config';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../css/LibraryDetail.css';

const LibraryExpertUpdate = () => {
  const { reptileId } = useParams();
  const [form, setForm] = useState({
    common_name: '',
    reptile_description: '',
    lifespan_years: '',
    natural_habitat: '',
    diet: '',
    image_url: '',
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${baseUrl}/reptitist/info/get-all-reptile`)
      .then(res => {
        const found = res.data.data.find(r => r._id === reptileId);
        if (found) {
          setForm({
            common_name: found.common_name || '',
            reptile_description: found.reptile_description || '',
            lifespan_years: found.lifespan_years || '',
            natural_habitat: found.natural_habitat || '',
            diet: found.diet || '',
            image_url: found.image_url || '',
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [reptileId]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
  
    try {
      const token = localStorage.getItem('access_token');
      console.log('Token in frontend:', token);

      await axios.put(
        `${baseUrl}/reptitist/info/update-reptile?id=${reptileId}`,
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      alert('Cập nhật thành công!');
      navigate(`/libraryExpertDetail/${reptileId}`);
    } catch (err) {
      console.error(err);
      alert('Lỗi khi cập nhật!');
    }
  };
  

  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <img src="/loading.gif" alt="Loading" style={{ width: 50, height: 50, marginRight: 12 }} />
      Đang tải dữ liệu...
    </div>
  );

  return (
    <>
      <Header />
      <div className="page-title-banner">
        <h1>Chỉnh sửa thông tin bò sát</h1>
      </div>
      <div className="container">
        <div className="breadcrumb">
          <Link to="/">Trang chủ</Link> <i className="fas fa-angle-right"></i>{' '}
          <Link to="/LibraryExpert">Thư viện chuyên sâu</Link> <i className="fas fa-angle-right"></i>{' '}
          <span>Chỉnh sửa</span>
        </div>
        <form onSubmit={handleSubmit} style={{ maxWidth: 500, margin: '0 auto', background: '#fff', borderRadius: 8, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label>Tên loài</label>
            <input name="common_name" value={form.common_name} onChange={handleChange} className="form-control" required />
          </div>
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label>Mô tả</label>
            <textarea name="reptile_description" value={form.reptile_description} onChange={handleChange} className="form-control" rows={3} />
          </div>
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label>Tuổi thọ (năm)</label>
            <input name="lifespan_years" value={form.lifespan_years} onChange={handleChange} className="form-control" type="number" min="0" />
          </div>
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label>Nhà ở tự nhiên</label>
            <input name="natural_habitat" value={form.natural_habitat} onChange={handleChange} className="form-control" />
          </div>
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label>Chế độ ăn</label>
            <input name="diet" value={form.diet} onChange={handleChange} className="form-control" />
          </div>
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label>Ảnh (URL)</label>
            <input name="image_url" value={form.image_url} onChange={handleChange} className="form-control" />
          </div>
          <button type="submit" className="btn btn-success" style={{ width: '100%' }}>Lưu thay đổi</button>
        </form>
      </div>
      <Footer />
    </>
  );
};

export default LibraryExpertUpdate; 