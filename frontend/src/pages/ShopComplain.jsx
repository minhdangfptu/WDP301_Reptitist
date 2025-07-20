import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const ShopComplain = () => {
  const query = useQuery();
  const productId = query.get('productId') || '';
  const { user } = useAuth();

  const [form, setForm] = useState({
    name: '',
    email: '',
    reason: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [productInfo, setProductInfo] = useState({ name: '', image: '' });

  useEffect(() => {
    // Nếu có productId, không set email từ user nữa
    if (!productId && user) {
      setForm((prev) => ({
        ...prev,
        name: user.fullname || user.username || '',
        email: user.email || '',
      }));
    }
  }, [user, productId]);

  // Nếu có productId, tự động lấy email và tên shop sở hữu sản phẩm
  useEffect(() => {
    const fetchProduct = async () => {
      if (productId) {
        try {
          const res = await fetch(`http://localhost:8080/reptitist/shop/products/detail/${productId}`);
          const data = await res.json();
          if (data) {
            setProductInfo({
              name: data.product_name || '',
              image: data.product_imageurl && data.product_imageurl.length > 0 ? data.product_imageurl[0] : ''
            });
            if (data.user_id && data.user_id.email) {
              setForm(prev => ({
                ...prev,
                email: data.user_id.email,
                name: data.user_id.username || prev.name
              }));
            }
          }
        } catch (err) {
          // fallback: giữ nguyên email cũ
        }
      }
    };
    fetchProduct();
    // eslint-disable-next-line
  }, [productId]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.reason) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc!');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('http://localhost:8080/reptitist/api/shop-complain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          productId,
          reason: form.reason,
          description: form.description
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Gửi khiếu nại thành công!');
        setForm({ ...form, reason: '', description: '' });
      } else {
        toast.error('Gửi khiếu nại thất bại!');
      }
    } catch (err) {
      toast.error('Có lỗi xảy ra khi gửi khiếu nại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <div className="container" style={{ maxWidth: 600, margin: '40px auto', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #eee', padding: 32 }}>
        <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Khiếu nại về sản phẩm</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Mã sản phẩm</label>
            <input type="text" className="form-control" value={productId} disabled readOnly />
          </div>
          {productId && (
            <>
              <div className="form-group">
                <label>Tên sản phẩm</label>
                <input type="text" className="form-control" value={productInfo.name} disabled readOnly />
              </div>
              {productInfo.image && (
                <div className="form-group">
                  <label>Ảnh sản phẩm</label><br />
                  <img src={productInfo.image} alt="Ảnh sản phẩm" style={{maxWidth: 120, maxHeight: 120, borderRadius: 8}} />
                </div>
              )}
            </>
          )}
          <div className="form-group">
            <label>Tên shop <span style={{ color: 'red' }}>*</span></label>
            <input type="text" className="form-control" name="name" value={form.name} onChange={handleChange} required readOnly={!!user} />
          </div>
          <div className="form-group">
            <label>Email <span style={{ color: 'red' }}>*</span></label>
            <input type="email" className="form-control" name="email" value={form.email} onChange={handleChange} required readOnly={!!user} />
          </div>
          <div className="form-group">
            <label>Lý do khiếu nại <span style={{ color: 'red' }}>*</span></label>
            <select className="form-control" name="reason" value={form.reason} onChange={handleChange} required>
              <option value="">-- Chọn lý do --</option>
              <option value="sản phẩm bị ẩn không hợp lý">Sản phẩm bị ẩn không hợp lý</option>
              <option value="báo cáo không chính xác">Báo cáo không chính xác</option>
              <option value="tôi đã chỉnh sửa, xin xem xét lại">Tôi đã chỉnh sửa, xin xem xét lại</option>
              <option value="khác">Khác</option>
            </select>
          </div>
          <div className="form-group">
            <label>Mô tả chi tiết</label>
            <textarea className="form-control" name="description" value={form.description} onChange={handleChange} rows={5} placeholder="Mô tả chi tiết về khiếu nại (nếu có)..." />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 16 }} disabled={submitting}>
            {submitting ? 'Đang gửi...' : 'Gửi khiếu nại'}
          </button>
        </form>
      </div>
      <Footer />
    </>
  );
};

export default ShopComplain; 