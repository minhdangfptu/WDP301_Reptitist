import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../css/AdminIncomeManagement.css';

const API_URL = '/api/admin/upgrade-plans';

const AdminUpgradePlanManagement = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [frequency, setFrequency] = useState('');
  const [sort, setSort] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editPlan, setEditPlan] = useState(null);
  const [form, setForm] = useState({ code: '', price: '', description: '', duration: '' });

  const fetchPlans = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (frequency) params.frequency = frequency;
      if (sort) params.sort = sort;
      const res = await axios.get(API_URL, { params });
      setPlans(res.data);
    } catch (err) {
      setError('Lỗi tải danh sách plan');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPlans();
    // eslint-disable-next-line
  }, [frequency, sort]);

  const openModal = (plan = null) => {
    setEditPlan(plan);
    setForm(plan ? { ...plan } : { code: '', price: '', description: '', duration: '' });
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setEditPlan(null);
    setForm({ code: '', price: '', description: '', duration: '' });
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      if (editPlan) {
        await axios.put(`${API_URL}/${editPlan._id}`, form);
      } else {
        await axios.post(API_URL, form);
      }
      closeModal();
      fetchPlans();
    } catch {
      setError('Lỗi lưu plan');
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('Xác nhận xóa plan này?')) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchPlans();
    } catch {
      setError('Lỗi xóa plan');
    }
  };

  return (
    <div className="admin-income-management">
      <div className="im-page-header">
        <div className="im-page-header-content">
          <div className="im-page-header-text">
            <h1><i className="fas fa-gem"></i> Quản lý Upgrade Plan</h1>
            <p>Thêm, sửa, xóa và lọc các gói nâng cấp cho hệ thống</p>
          </div>
        </div>
      </div>
      <div className="im-filters-section">
        <div className="im-filters-row">
          <div className="im-filter-group">
            <label className="im-filter-label">Lọc theo thời hạn (tháng):</label>
            <input type="number" min="1" name="frequency" value={frequency} onChange={e => setFrequency(e.target.value)} className="im-filter-input" placeholder="VD: 1, 3, 12..." />
          </div>
          <div className="im-filter-group">
            <label className="im-filter-label">Sắp xếp theo giá:</label>
            <select value={sort} onChange={e => setSort(e.target.value)} className="im-filter-select">
              <option value="">--Chọn--</option>
              <option value="asc">Tăng dần</option>
              <option value="desc">Giảm dần</option>
            </select>
          </div>
          <button className="im-filter-button" onClick={() => openModal()}><i className="fas fa-plus"></i> Thêm Upgrade Plan</button>
        </div>
      </div>
      <div className="im-table-section">
        {loading ? <div className="im-loading-state"><div className="im-spinner"></div>Đang tải...</div> : error ? <div className="im-error-state"><i className="fas fa-exclamation-triangle"></i> {error}</div> : (
          <table className="im-income-table">
            <thead>
              <tr>
                <th>Mã</th>
                <th>Giá</th>
                <th>Mô tả</th>
                <th>Thời hạn (tháng)</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(plans) && plans.map(plan => (
                <tr key={plan._id || plan.code}>
                  <td>{plan.code}</td>
                  <td>{plan.price}</td>
                  <td>{plan.description}</td>
                  <td>{plan.duration}</td>
                  <td>
                    <button className="im-filter-button" style={{marginRight: 8}} onClick={() => openModal(plan)}><i className="fas fa-edit"></i> Sửa</button>
                    <button className="im-reset-button" onClick={() => handleDelete(plan._id)}><i className="fas fa-trash"></i> Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{marginBottom: 16}}>{editPlan ? 'Sửa' : 'Thêm'} Upgrade Plan</h3>
            <form onSubmit={handleSubmit}>
              <div className="im-filter-group">
                <label className="im-filter-label">Mã:</label>
                <input name="code" value={form.code} onChange={handleChange} required className="im-filter-input" />
              </div>
              <div className="im-filter-group">
                <label className="im-filter-label">Giá:</label>
                <input name="price" type="number" min="0" value={form.price} onChange={handleChange} required className="im-filter-input" />
              </div>
              <div className="im-filter-group">
                <label className="im-filter-label">Mô tả:</label>
                <input name="description" value={form.description} onChange={handleChange} className="im-filter-input" />
              </div>
              <div className="im-filter-group">
                <label className="im-filter-label">Thời hạn (tháng):</label>
                <input name="duration" type="number" min="1" value={form.duration} onChange={handleChange} required className="im-filter-input" />
              </div>
              <div style={{display: 'flex', gap: 12, marginTop: 20}}>
                <button type="submit" className="im-filter-button"><i className="fas fa-save"></i> Lưu</button>
                <button type="button" className="im-reset-button" onClick={closeModal}>Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUpgradePlanManagement; 