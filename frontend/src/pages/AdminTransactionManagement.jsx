import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { baseUrl } from '../config';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import '../css/AdminTransactionManagement.css';

const AdminTransactionManagement = () => {
  const { user, hasRole } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Filter states
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('');
  // Xóa/sửa
  const [deleteId, setDeleteId] = useState(null);
  const [editTx, setEditTx] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (user && hasRole('admin')) {
      fetchTransactions();
    }
  }, [user]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('refresh_token');
      const response = await axios.get(`${baseUrl}/reptitist/transactions/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setTransactions(response.data.transactions || []);
      setError('');
    } catch (err) {
      setError('Không thể tải dữ liệu giao dịch.');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý filter thực tế
  const filterTransactions = () => {
    let filtered = [...transactions];
    if (statusFilter !== 'all') filtered = filtered.filter(tx => tx.status === statusFilter);
    if (userFilter.trim()) filtered = filtered.filter(tx => (tx.user?.username || tx.user_id)?.toLowerCase().includes(userFilter.trim().toLowerCase()));
    if (dateFilter !== 'all') {
      const now = new Date();
      let startDate;
      switch (dateFilter) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        case 'year':
          startDate = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
        default:
          startDate = null;
      }
      if (startDate) filtered = filtered.filter(tx => new Date(tx.transaction_date) >= startDate);
    }
    return filtered;
  };
  const filteredTransactions = filterTransactions();

  // Biểu đồ
  const statusCounts = filteredTransactions.reduce((acc, tx) => {
    acc[tx.status] = (acc[tx.status] || 0) + 1;
    return acc;
  }, {});
  const barChartData = Object.entries(statusCounts).map(([status, count]) => ({ name: status, value: count }));
  
  const typeCounts = filteredTransactions.reduce((acc, tx) => {
    acc[tx.transaction_type] = (acc[tx.transaction_type] || 0) + 1;
    return acc;
  }, {});
  const pieChartData = Object.entries(typeCounts).map(([type, count]) => ({ name: type, value: count }));
  
  const dateSums = {};
  filteredTransactions.forEach(tx => {
    const date = new Date(tx.transaction_date).toLocaleDateString('vi-VN');
    dateSums[date] = (dateSums[date] || 0) + tx.amount;
  });
  const lineChartData = Object.entries(dateSums).map(([date, sum]) => ({ name: date, value: sum }));

  // Xử lý xóa
  const handleDelete = async (id) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('refresh_token');
      await axios.delete(`${baseUrl}/reptitist/transactions/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setDeleteId(null);
      fetchTransactions();
    } catch (err) {
      alert(err?.response?.data?.message || 'Xóa thất bại');
    } finally {
      setActionLoading(false);
    }
  };

  // Xử lý sửa
  const openEdit = (tx) => {
    setEditTx(tx);
    setEditForm({
      amount: tx.amount,
      transaction_type: tx.transaction_type,
      status: tx.status,
      description: tx.description || '',
    });
  };
  
  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };
  
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const token = localStorage.getItem('refresh_token');
      await axios.put(`${baseUrl}/reptitist/transactions/${editTx._id}`, editForm, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setEditTx(null);
      fetchTransactions();
    } catch (err) {
      alert(err?.response?.data?.message || 'Cập nhật thất bại');
    } finally {
      setActionLoading(false);
    }
  };

  // Helper functions
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'completed': return 'status-completed';
      case 'pending': return 'status-pending';
      case 'failed': return 'status-failed';
      default: return 'status-pending';
    }
  };

  const getTypeBadgeClass = (type) => {
    switch (type) {
      case 'subscription': return 'type-subscription';
      case 'topup': return 'type-topup';
      case 'refund': return 'type-refund';
      default: return 'type-subscription';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Hoàn thành';
      case 'pending': return 'Đang chờ';
      case 'failed': return 'Thất bại';
      default: return status;
    }
  };

  const getTypeText = (type) => {
    switch (type) {
      case 'subscription': return 'Đăng ký';
      case 'topup': return 'Nạp tiền';
      case 'refund': return 'Hoàn tiền';
      default: return type;
    }
  };

  if (!user || !hasRole('admin')) {
    return (
      <>
        <Header />
        <div className="admin-transaction-management">
          <div className="um-no-access">
            <i className="fas fa-exclamation-triangle um-warning-icon"></i>
            <h2>Không có quyền truy cập</h2>
            <p>Bạn không có quyền xem trang này. Chỉ có Admin mới có thể truy cập.</p>
            <a href="/" className="pm-btn pm-btn-primary">
              <i className="fas fa-home"></i>
              Về trang chủ
            </a>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="admin-transaction-management">
        {/* Page Header */}
        <div className="pm-page-header">
          <div className="pm-page-header-content">
            <div className="pm-page-header-text">
              <h1>
                <i className="fas fa-chart-line"></i>
                Quản lý giao dịch các gói dịch vụ
              </h1>
              <p>Thống kê, chỉnh sửa, xóa và lọc các giao dịch của hệ thống</p>
            </div>
          </div>
        </div>

        {/* Filter section */}
        <div className="pm-filters-section">
          <div>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '150px' }}>
                <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>Trạng thái:</label>
                <select 
                  className="pm-filter-select" 
                  value={statusFilter} 
                  onChange={e => setStatusFilter(e.target.value)}
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="completed">Hoàn thành</option>
                  <option value="pending">Đang chờ</option>
                  <option value="failed">Thất bại</option>
                </select>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '150px' }}>
                <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>Thời gian:</label>
                <select 
                  className="pm-filter-select" 
                  value={dateFilter} 
                  onChange={e => setDateFilter(e.target.value)}
                >
                  <option value="all">Tất cả thời gian</option>
                  <option value="today">Hôm nay</option>
                  <option value="week">Tuần này</option>
                  <option value="month">Tháng này</option>
                  <option value="year">Năm nay</option>
                </select>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '200px', flex: 1 }}>
                <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>Tìm kiếm:</label>
                <input 
                  className="pm-search-input" 
                  type="text" 
                  placeholder="Tìm theo tên user..." 
                  value={userFilter} 
                  onChange={e => setUserFilter(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Charts section */}
        <div className="transaction-charts-grid">
          <div className="chart-card">
            <h3>
              <i className="fas fa-chart-bar"></i>
              Trạng thái giao dịch
            </h3>
            <div className="chart-container">
              {barChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={barChartData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="chart-empty">
                  <i className="fas fa-chart-bar"></i>
                  <span>Không có dữ liệu</span>
                </div>
              )}
            </div>
          </div>

          <div className="chart-card">
            <h3>
              <i className="fas fa-chart-line"></i>
              Tổng tiền theo ngày
            </h3>
            <div className="chart-container">
              {lineChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={lineChartData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="chart-empty">
                  <i className="fas fa-chart-line"></i>
                  <span>Không có dữ liệu</span>
                </div>
              )}
            </div>
          </div>

          <div className="chart-card">
            <h3>
              <i className="fas fa-chart-pie"></i>
              Loại giao dịch
            </h3>
            <div className="chart-container">
              {pieChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie 
                      data={pieChartData} 
                      dataKey="value" 
                      nameKey="name" 
                      cx="50%" 
                      cy="50%" 
                      outerRadius={80} 
                      label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"][index % 5]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="chart-empty">
                  <i className="fas fa-chart-pie"></i>
                  <span>Không có dữ liệu</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Transaction table */}
        <div className="pm-table-section">
          <div>
            <h2>Danh sách giao dịch ({filteredTransactions.length})</h2>
            {loading ? (
              <div className="pm-loading-state">
                <div className="loading-spinner"></div>
                <p>Đang tải dữ liệu...</p>
              </div>
            ) : error ? (
              <div style={{ color: '#ef4444', textAlign: 'center', padding: '40px' }}>
                <i className="fas fa-exclamation-circle" style={{ fontSize: '48px', marginBottom: '16px' }}></i>
                <p>{error}</p>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                <i className="fas fa-inbox" style={{ fontSize: '48px', marginBottom: '16px' }}></i>
                <p>Không có giao dịch nào</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="pm-products-table">
                  <thead>
                    <tr>
                      <th>ID Giao dịch</th>
                      <th>User</th>
                      <th>Loại giao dịch</th>
                      <th>Số tiền</th>
                      <th>Trạng thái</th>
                      <th>Ngày giao dịch</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map(tx => (
                      <tr key={tx._id} className="pm-table-row">
                        <td>
                          <span className="transaction-id">{tx._id}</span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontSize: '14px',
                              fontWeight: '600'
                            }}>
                              {(tx.user_id?.username || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: '600', color: '#1f2937' }}>
                                {tx.user_id?.username || 'N/A'}
                              </div>
                              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                ID: {tx.user_id?._id?.slice(-8) || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={getTypeBadgeClass(tx.transaction_type)}>
                            {getTypeText(tx.transaction_type)}
                          </span>
                        </td>
                        <td>
                          <span className={`transaction-amount ${tx.amount > 0 ? 'positive' : 'negative'}`}>
                            {formatCurrency(tx.amount)}
                          </span>
                        </td>
                        <td>
                          <span className={getStatusBadgeClass(tx.status)}>
                            {getStatusText(tx.status)}
                          </span>
                        </td>
                        <td>
                          <div>
                            <div style={{ fontWeight: '500', color: '#1f2937' }}>
                              {new Date(tx.transaction_date).toLocaleDateString('vi-VN')}
                            </div>
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>
                              {new Date(tx.transaction_date).toLocaleTimeString('vi-VN')}
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button 
                              className="pm-btn pm-btn-danger" 
                              disabled={tx.status !== 'pending' || actionLoading} 
                              onClick={() => setDeleteId(tx._id)}
                              style={{ fontSize: '12px', padding: '6px 12px' }}
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                            <button 
                              className="pm-btn pm-btn-edit" 
                              disabled={actionLoading} 
                              onClick={() => openEdit(tx)}
                              style={{ fontSize: '12px', padding: '6px 12px' }}
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Modal xác nhận xóa */}
        {deleteId && (
          <div className="pm-modal-overlay">
            <div className="pm-modal pm-delete-modal">
              <div className="pm-modal-header">
                <h3>
                  <i className="fas fa-exclamation-triangle" style={{ color: '#ef4444' }}></i>
                  Xác nhận xóa giao dịch
                </h3>
              </div>
              <div className="pm-modal-body">
                <p>Bạn có chắc chắn muốn xóa giao dịch này không? Hành động này không thể hoàn tác.</p>
              </div>
              <div className="pm-modal-footer">
                <button 
                  className="pm-btn pm-btn-secondary" 
                  onClick={() => setDeleteId(null)} 
                  disabled={actionLoading}
                >
                  <i className="fas fa-times"></i>
                  Hủy
                </button>
                <button 
                  className="pm-btn pm-btn-danger" 
                  onClick={() => handleDelete(deleteId)} 
                  disabled={actionLoading}
                >
                  <i className="fas fa-trash"></i>
                  {actionLoading ? 'Đang xóa...' : 'Xác nhận xóa'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal sửa giao dịch */}
        {editTx && (
          <div className="pm-modal-overlay">
            <form className="pm-modal" onSubmit={handleEditSubmit} style={{ minWidth: '400px' }}>
              <div className="pm-modal-header">
                <h3>
                  <i className="fas fa-edit" style={{ color: '#f59e0b' }}></i>
                  Chỉnh sửa giao dịch
                </h3>
              </div>
              <div className="pm-modal-body">
                <div className="pm-form-group">
                  <label>Số tiền:</label>
                  <input 
                    className="pm-form-input" 
                    name="amount" 
                    type="number" 
                    value={editForm.amount} 
                    disabled 
                    style={{ background: '#f3f4f6', color: '#6b7280' }}
                  />
                  <small style={{ color: '#6b7280', fontSize: '12px' }}>Số tiền không thể thay đổi</small>
                </div>
                
                <div className="pm-form-group">
                  <label>Loại giao dịch:</label>
                  <input 
                    className="pm-form-input" 
                    name="transaction_type" 
                    value={getTypeText(editForm.transaction_type)} 
                    disabled 
                    style={{ background: '#f3f4f6', color: '#6b7280' }}
                  />
                  <small style={{ color: '#6b7280', fontSize: '12px' }}>Loại giao dịch không thể thay đổi</small>
                </div>
                
                <div className="pm-form-group">
                  <label>Trạng thái: <span style={{ color: '#ef4444' }}>*</span></label>
                  <select 
                    className="pm-form-input" 
                    name="status" 
                    value={editForm.status} 
                    onChange={handleEditChange} 
                    required
                  >
                    <option value="pending">Đang chờ</option>
                    <option value="completed">Hoàn thành</option>
                    <option value="failed">Thất bại</option>
                  </select>
                </div>
                
                <div className="pm-form-group">
                  <label>Mô tả:</label>
                  <input 
                    className="pm-form-input" 
                    name="description" 
                    value={editForm.description} 
                    disabled 
                    style={{ background: '#f3f4f6', color: '#6b7280' }}
                  />
                  <small style={{ color: '#6b7280', fontSize: '12px' }}>Mô tả không thể thay đổi</small>
                </div>
              </div>
              <div className="pm-modal-footer">
                <button 
                  className="pm-btn pm-btn-secondary" 
                  type="button" 
                  onClick={() => setEditTx(null)} 
                  disabled={actionLoading}
                >
                  <i className="fas fa-times"></i>
                  Hủy
                </button>
                <button 
                  className="pm-btn pm-btn-primary" 
                  type="submit" 
                  disabled={actionLoading}
                >
                  <i className="fas fa-save"></i>
                  {actionLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default AdminTransactionManagement;