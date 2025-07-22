import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { baseUrl } from '../config';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import paymentApi from '../api/paymentApi';
import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';
import '../css/AdminTransactionManagement.css';

const TRANSACTION_TYPES = [
  { value: 'all', label: 'Tất cả' },
  { value: 'payment', label: 'Thanh toán' },
  { value: 'refund', label: 'Hoàn tiền' },
  { value: 'subscription', label: 'Đăng ký' },
  { value: 'topup', label: 'Nạp tiền' },
];
const STATUS_TYPES = [
  { value: 'all', label: 'Tất cả' },
  { value: 'pending', label: 'Đang chờ' },
  { value: 'completed', label: 'Hoàn thành' },
  { value: 'failed', label: 'Thất bại' },
  { value: 'refunded', label: 'Đã hoàn tiền' },
];

const AdminTransactionManagement = () => {
  const { user, hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState('management'); // 'management' or 'reports'
  
  // Management tab states
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

  // Reports tab states
  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportsError, setReportsError] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [transactionType, setTransactionType] = useState('all');
  const [status, setStatus] = useState('all');

  useEffect(() => {
    console.log('User changed:', user);
    console.log('Has admin role:', hasRole('admin'));
    
    if (user && hasRole('admin')) {
      if (activeTab === 'management') {
        fetchTransactions();
      } else {
        fetchReports();
      }
    }
  }, [user]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Sử dụng access_token từ localStorage
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        setError('Không tìm thấy token. Vui lòng đăng nhập lại.');
        return;
      }

      console.log('Fetching transactions with token:', token?.substring(0, 20) + '...');
      
      const response = await axios.get(`${baseUrl}/reptitist/transactions/all`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Transactions response:', response.data);
      
      if (response.data.success) {
        setTransactions(response.data.transactions || []);
        setError('');
      } else {
        setError(response.data.error || 'Không thể tải dữ liệu giao dịch');
        setTransactions([]);
      }
      
    } catch (err) {
      console.error('Fetch transactions error:', err);
      console.error('Error response:', err.response?.data);
      
      // Xử lý lỗi chi tiết
      if (err.response?.status === 403) {
        setError('Bạn không có quyền xem dữ liệu giao dịch. Chỉ Admin mới có thể truy cập.');
      } else if (err.response?.status === 401) {
        setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        // Có thể redirect về login
        setTimeout(() => {
          window.location.href = '/login';
        }, 3000);
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Không thể tải dữ liệu giao dịch. Vui lòng thử lại.');
      }
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    try {
      setReportsLoading(true);
      setReportsError('');
      const data = await paymentApi.getAdminFinancialReports({
        page,
        limit,
        startDate,
        endDate,
        transaction_type: transactionType,
        status,
      });
      setReports(data.transactions || []);
      setTotalPages(data.pagination?.pages || 1);
      setTotal(data.pagination?.total || 0);
    } catch (err) {
      setReportsError('Không thể tải báo cáo tài chính: ' + (err.response?.data?.message || err.message));
      setReports([]);
    } finally {
      setReportsLoading(false);
    }
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchReports();
  };

  const handleResetFilters = () => {
    setStartDate('');
    setEndDate('');
    setTransactionType('all');
    setStatus('all');
    setPage(1);
    setTimeout(() => fetchReports(), 100);
  };

  // Filter transactions
  const filterTransactions = () => {
    let filtered = [...transactions];
    
    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(tx => tx.status === statusFilter);
    }
    
    // Filter by user
    if (userFilter.trim()) {
      const searchTerm = userFilter.trim().toLowerCase();
      filtered = filtered.filter(tx => {
        const username = tx.user_id?.username || '';
        const email = tx.user_id?.email || '';
        const fullname = tx.user_id?.fullname || '';
        return username.toLowerCase().includes(searchTerm) ||
               email.toLowerCase().includes(searchTerm) ||
               fullname.toLowerCase().includes(searchTerm);
      });
    }
    
    // Filter by date
    if (dateFilter !== 'all') {
      const now = new Date();
      let startDate;
      
      switch (dateFilter) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
          break;
        case 'month':
          startDate = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
          break;
        case 'year':
          startDate = new Date(now.getTime() - (365 * 24 * 60 * 60 * 1000));
          break;
        default:
          startDate = null;
      }
      
      if (startDate) {
        filtered = filtered.filter(tx => {
          const txDate = new Date(tx.transaction_date || tx.createdAt);
          return txDate >= startDate;
        });
      }
    }
    
    return filtered;
  };

  const filteredTransactions = filterTransactions();

  // Helper functions
  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Hoàn thành';
      case 'pending': return 'Đang chờ';
      case 'failed': return 'Thất bại';
      case 'refunded': return 'Đã hoàn tiền';
      default: return status;
    }
  };

  const getTypeText = (type) => {
    switch (type) {
      case 'subscription': return 'Đăng ký';
      case 'topup': return 'Nạp tiền';
      case 'refund': return 'Hoàn tiền';
      case 'payment': return 'Thanh toán';
      default: return type;
    }
  };

  // Chart data preparation
  const statusCounts = filteredTransactions.reduce((acc, tx) => {
    acc[tx.status] = (acc[tx.status] || 0) + 1;
    return acc;
  }, {});
  const barChartData = Object.entries(statusCounts).map(([status, count]) => ({ 
    name: getStatusText(status), 
    value: count 
  }));
  
  const typeCounts = filteredTransactions.reduce((acc, tx) => {
    acc[tx.transaction_type] = (acc[tx.transaction_type] || 0) + 1;
    return acc;
  }, {});
  const pieChartData = Object.entries(typeCounts).map(([type, count]) => ({ 
    name: getTypeText(type), 
    value: count 
  }));
  
  const dateSums = {};
  filteredTransactions.forEach(tx => {
    const date = new Date(tx.transaction_date || tx.createdAt).toLocaleDateString('vi-VN');
    dateSums[date] = (dateSums[date] || 0) + tx.amount;
  });
  const lineChartData = Object.entries(dateSums)
    .map(([date, sum]) => ({ name: date, value: sum }))
    .sort((a, b) => new Date(a.name.split('/').reverse().join('-')) - new Date(b.name.split('/').reverse().join('-')));

  // Handle delete transaction
  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa giao dịch này?')) {
      return;
    }
    
    setActionLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.delete(`${baseUrl}/reptitist/transactions/admin/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setDeleteId(null);
        fetchTransactions();
        alert('Xóa giao dịch thành công!');
      } else {
        alert(response.data.error || 'Xóa thất bại');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert(err?.response?.data?.message || err?.response?.data?.error || 'Xóa thất bại');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle edit transaction
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
      const token = localStorage.getItem('access_token');
      const response = await axios.put(`${baseUrl}/reptitist/transactions/admin/${editTx._id}`, editForm, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setEditTx(null);
        fetchTransactions();
        alert('Cập nhật giao dịch thành công!');
      } else {
        alert(response.data.error || 'Cập nhật thất bại');
      }
    } catch (err) {
      console.error('Edit error:', err);
      alert(err?.response?.data?.message || err?.response?.data?.error || 'Cập nhật thất bại');
    } finally {
      setActionLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'completed': return 'status-completed';
      case 'pending': return 'status-pending';
      case 'failed': return 'status-failed';
      case 'refunded': return 'status-refunded';
      default: return 'status-pending';
    }
  };

  const getTypeBadgeClass = (type) => {
    switch (type) {
      case 'subscription': return 'type-subscription';
      case 'topup': return 'type-topup';
      case 'refund': return 'type-refund';
      case 'payment': return 'type-payment';
      default: return 'type-subscription';
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
              <p>Thống kê, chỉnh sửa và quản lý các giao dịch của người dùng</p>
              {user && (
                <div style={{ fontSize: '14px', opacity: 0.9, marginTop: '8px' }}>
                  Đăng nhập với quyền: <strong>{user.role || 'N/A'}</strong>
                </div>
              )}
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
                <p>Bạn có chắc chắn muốn xóa giao dịch này không?</p>
                <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '8px' }}>
                  <strong>Lưu ý:</strong> Hành động này không thể hoàn tác!
                </p>
                <div style={{ 
                  background: '#f3f4f6', 
                  padding: '12px', 
                  borderRadius: '8px', 
                  marginTop: '16px',
                  fontSize: '14px'
                }}>
                  <strong>ID:</strong> {deleteId?.slice(-8)}<br/>
                  <strong>Giao dịch:</strong> {transactions.find(tx => tx._id === deleteId)?.transaction_type}<br/>
                  <strong>Số tiền:</strong> {formatCurrency(transactions.find(tx => tx._id === deleteId)?.amount || 0)}
                </div>
              </div>
              <div className="pm-modal-footer">
                <button 
                  className="pm-btn pm-btn-secondary" 
                  onClick={() => setDeleteId(null)} 
                  disabled={actionLoading}
                >
                  <i className="fas fa-times"></i>
                  Hủy bỏ
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
            <form className="pm-modal" onSubmit={handleEditSubmit} style={{ minWidth: '500px', maxWidth: '600px' }}>
              <div className="pm-modal-header">
                <h3>
                  <i className="fas fa-edit" style={{ color: '#f59e0b' }}></i>
                  Chỉnh sửa giao dịch
                </h3>
              </div>
              <div className="pm-modal-body">
                <div className="pm-form-group">
                  <label>ID giao dịch:</label>
                  <input 
                    className="pm-form-input" 
                    value={editTx._id} 
                    disabled 
                    style={{ background: '#f3f4f6', color: '#6b7280', fontFamily: 'monospace', fontSize: '12px' }}
                  />
                </div>

                <div className="pm-form-group">
                  <label>Người dùng:</label>
                  <input 
                    className="pm-form-input" 
                    value={editTx.user_id?.username || editTx.user_id?.email || 'N/A'} 
                    disabled 
                    style={{ background: '#f3f4f6', color: '#6b7280' }}
                  />
                </div>
                
                <div className="pm-form-group">
                  <label>Số tiền:</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input 
                      className="pm-form-input" 
                      value={formatCurrency(editForm.amount)} 
                      disabled 
                      style={{ background: '#f3f4f6', color: '#6b7280', flex: 1 }}
                    />
                    <small style={{ color: '#6b7280', fontSize: '12px', minWidth: 'max-content' }}>
                      
                    </small>
                  </div>
                </div>
                
                <div className="pm-form-group">
                  <label>Loại giao dịch:</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input 
                      className="pm-form-input" 
                      value={getTypeText(editForm.transaction_type)} 
                      disabled 
                      style={{ background: '#f3f4f6', color: '#6b7280', flex: 1 }}
                    />
                    <small style={{ color: '#6b7280', fontSize: '12px', minWidth: 'max-content' }}>
                      
                    </small>
                  </div>
                </div>
                
                <div className="pm-form-group">
                  <label>
                    Trạng thái: <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select 
                    className="pm-form-input" 
                    name="status" 
                    value={editForm.status} 
                    onChange={handleEditChange} 
                    required
                    style={{ background: 'white' }}
                  >
                    <option value="pending">Đang chờ</option>
                    <option value="completed">Hoàn thành</option>
                    <option value="failed">Thất bại</option>
                    <option value="refunded">Đã hoàn tiền</option>
                  </select>
                  <small style={{ color: '#059669', fontSize: '12px' }}>
                    Đây là trường duy nhất có thể chỉnh sửa
                  </small>
                </div>
                
                <div className="pm-form-group">
                  <label>Mô tả:</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <textarea 
                      className="pm-form-input" 
                      value={editForm.description} 
                      disabled 
                      rows={3}
                      style={{ background: '#f3f4f6', color: '#6b7280', flex: 1, resize: 'vertical' }}
                    />
                    <small style={{ color: '#6b7280', fontSize: '12px', minWidth: 'max-content' }}>
                      
                    </small>
                  </div>
                </div>

                <div style={{ 
                  background: '#fffbeb', 
                  border: '1px solid #fcd34d', 
                  borderRadius: '8px', 
                  padding: '12px', 
                  marginTop: '16px' 
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <i className="fas fa-info-circle" style={{ color: '#f59e0b' }}></i>
                    <strong style={{ color: '#92400e' }}>Lưu ý quan trọng:</strong>
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '16px', color: '#92400e', fontSize: '14px' }}>
                    <li>Chỉ có thể chỉnh sửa trạng thái giao dịch</li>
                    <li>Việc thay đổi trạng thái có thể ảnh hưởng đến hệ thống thanh toán</li>
                    <li>Hãy chắc chắn trước khi thực hiện thay đổi</li>
                  </ul>
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
                  Hủy bỏ
                </button>
                <button 
                  className="pm-btn pm-btn-primary" 
                  type="submit" 
                  disabled={actionLoading || editForm.status === editTx.status}
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