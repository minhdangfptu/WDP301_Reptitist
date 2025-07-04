import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { baseUrl } from '../config';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import '../css/AdminTransactionManagement.css';

const AdminTransactionManagement = () => {
  const { user, hasRole, loading: authLoading } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState('all'); // 'all', 'customer', 'shop'
  
  // Modal states
  const [deleteId, setDeleteId] = useState(null);
  const [editTx, setEditTx] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {

    if (user && !authLoading) {
      fetchTransactions();
    }
  }, [user, authLoading]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Thử cả access_token và refresh_token
      let token = localStorage.getItem('access_token');
      if (!token) {
        token = localStorage.getItem('refresh_token');
      }
      
      if (!token) {
        setError('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
        return;
      }



      const response = await axios.get(`${baseUrl}/reptitist/transactions/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      

      setTransactions(response.data.transactions || []);
      
    } catch (err) {
      console.error('Error fetching transactions:', err);
      console.error('Error response:', err.response);
      
      if (err.response?.status === 401) {
        setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        // Có thể redirect về login
        // window.location.href = '/login';
      } else if (err.response?.status === 403) {
        setError('Bạn không có quyền truy cập API này. Kiểm tra role Admin.');
      } else if (err.response?.status === 404) {
        setError('API endpoint không tồn tại.');
      } else {
        setError(err.response?.data?.error || err.message || 'Không thể tải dữ liệu giao dịch.');
      }
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to determine user type based on account_type
  const getUserType = (userData) => {
    if (!userData || !userData.account_type) return 'unknown';
    
    const accountType = userData.account_type.type;
    if (accountType === 1 || accountType === 2) {
      return 'customer';
    } else if (accountType === 3 || accountType === 4) {
      return 'shop';
    }
    return 'unknown';
  };

  // Helper function to get user type display text
  const getUserTypeDisplay = (userData) => {
    if (!userData || !userData.account_type) return 'Unknown';
    
    const accountType = userData.account_type.type;
    switch (accountType) {
      case 1: return 'Customer';
      case 2: return 'Customer Premium';
      case 3: return 'Shop';
      case 4: return 'Shop Premium';
      default: return 'Unknown';
    }
  };

  // Filter transactions
  const filterTransactions = () => {
    let filtered = [...transactions];
    
    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(tx => tx.status === statusFilter);
    }
    
    // Filter by user type
    if (userTypeFilter !== 'all') {
      filtered = filtered.filter(tx => {
        const userType = getUserType(tx.user_id);
        return userType === userTypeFilter;
      });
    }
    
    // Filter by user
    if (userFilter.trim()) {
      filtered = filtered.filter(tx => {
        const userData = tx.user_id;
        if (!userData) return false;
        
        const searchTerm = userFilter.trim().toLowerCase();
        const username = userData.username?.toLowerCase() || '';
        const email = userData.email?.toLowerCase() || '';
        const userId = userData._id?.toLowerCase() || '';
        
        return username.includes(searchTerm) || 
               email.includes(searchTerm) || 
               userId.includes(searchTerm);
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
          const txDate = new Date(tx.createdAt || tx.transaction_date);
          return txDate >= startDate;
        });
      }
    }
    
    return filtered;
  };

  const filteredTransactions = filterTransactions();

  // Helper functions - Move these up before prepareChartData
  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Hoàn thành';
      case 'pending': return 'Đang chờ';
      case 'failed': return 'Thất bại';
      case 'refunded': return 'Đã hoàn tiền';
      default: return status || 'N/A';
    }
  };

  const getTypeText = (type) => {
    switch (type) {
      case 'payment': return 'Thanh toán';
      case 'refund': return 'Hoàn tiền';
      case 'premium_upgrade': return 'Nâng cấp Premium';
      case 'subscription': return 'Đăng ký dịch vụ';
      case 'topup': return 'Nạp tiền';
      default: return type || 'N/A';
    }
  };

  // Chart data preparation
  const prepareChartData = () => {
    // Status distribution
    const statusCounts = filteredTransactions.reduce((acc, tx) => {
      acc[tx.status] = (acc[tx.status] || 0) + 1;
      return acc;
    }, {});
    
    const barChartData = Object.entries(statusCounts).map(([status, count]) => ({ 
      name: getStatusText(status), 
      value: count,
      status: status
    }));
    
    // Transaction type distribution
    const typeCounts = filteredTransactions.reduce((acc, tx) => {
      acc[tx.transaction_type] = (acc[tx.transaction_type] || 0) + 1;
      return acc;
    }, {});
    
    const pieChartData = Object.entries(typeCounts).map(([type, count]) => ({ 
      name: getTypeText(type), 
      value: count,
      type: type
    }));
    
    // Daily transaction amounts
    const dailyData = {};
    filteredTransactions.forEach(tx => {
      const date = new Date(tx.createdAt || tx.transaction_date).toLocaleDateString('vi-VN');
      if (!dailyData[date]) {
        dailyData[date] = { total: 0, count: 0 };
      }
      dailyData[date].total += Math.abs(tx.amount || 0);
      dailyData[date].count += 1;
    });
    
    const lineChartData = Object.entries(dailyData)
      .map(([date, data]) => ({
        name: date,
        value: data.total,
        count: data.count
      }))
      .sort((a, b) => new Date(a.name.split('/').reverse().join('-')) - new Date(b.name.split('/').reverse().join('-')));
    
    return { barChartData, pieChartData, lineChartData };
  };

  const { barChartData, pieChartData, lineChartData } = prepareChartData();

  const handleDelete = async (id) => {
    try {
      setActionLoading(true);
      
      let token = localStorage.getItem('access_token');
      if (!token) {
        token = localStorage.getItem('refresh_token');
      }
      
      if (!token) {
        setError('Không tìm thấy token xác thực');
        return;
      }

      const response = await axios.delete(`${baseUrl}/reptitist/transactions/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 200) {
        setTransactions(prev => prev.filter(tx => tx._id !== id));
        setDeleteId(null);
      }
    } catch (err) {
      console.error('Error deleting transaction:', err);
      setError(err.response?.data?.error || 'Không thể xóa giao dịch');
    } finally {
      setActionLoading(false);
    }
  };

  const openEdit = (tx) => {
    setEditTx(tx);
    setEditForm({
      status: tx.status || 'pending',
      description: tx.description || ''
    });
  };

  const handleEditChange = (e) => {
    setEditForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      
      let token = localStorage.getItem('access_token');
      if (!token) {
        token = localStorage.getItem('refresh_token');
      }
      
      if (!token) {
        setError('Không tìm thấy token xác thực');
        return;
      }

      const response = await axios.put(`${baseUrl}/reptitist/transactions/${editTx._id}`, editForm, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 200) {
        setTransactions(prev => prev.map(tx => 
          tx._id === editTx._id 
            ? { ...tx, ...editForm }
            : tx
        ));
        setEditTx(null);
      }
    } catch (err) {
      console.error('Error updating transaction:', err);
      setError(err.response?.data?.error || 'Không thể cập nhật giao dịch');
    } finally {
      setActionLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (typeof amount !== 'number') return '0 VNĐ';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'completed': return 'pm-badge pm-badge-success';
      case 'pending': return 'pm-badge pm-badge-warning';
      case 'failed': return 'pm-badge pm-badge-danger';
      case 'refunded': return 'pm-badge pm-badge-info';
      default: return 'pm-badge pm-badge-secondary';
    }
  };

  const getTypeBadgeClass = (type) => {
    switch (type) {
      case 'payment': return 'pm-badge pm-badge-primary';
      case 'refund': return 'pm-badge pm-badge-info';
      case 'premium_upgrade': return 'pm-badge pm-badge-warning';
      case 'subscription': return 'pm-badge pm-badge-success';
      case 'topup': return 'pm-badge pm-badge-secondary';
      default: return 'pm-badge pm-badge-secondary';
    }
  };

  const getUserTypeBadgeClass = (userType) => {
    switch (userType) {
      case 'customer': return 'pm-badge pm-badge-primary';
      case 'shop': return 'pm-badge pm-badge-success';
      default: return 'pm-badge pm-badge-secondary';
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return {
        date: date.toLocaleDateString('vi-VN'),
        time: date.toLocaleTimeString('vi-VN')
      };
    } catch (error) {
      return { date: 'N/A', time: 'N/A' };
    }
  };

  const getUserDisplayName = (userData) => {
    if (!userData) return 'N/A';
    return userData.username || userData.email || `User-${userData._id?.slice(-6)}` || 'Unknown';
  };

  // Access control - Cải thiện logic kiểm tra quyền với debug chi tiết
  if (authLoading) {
    return (
      <>
        <Header />
        <div className="admin-transaction-management">
          <div className="pm-loading-state">
            <div className="loading-spinner"></div>
            <p>Đang xác thực người dùng...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Header />
        <div className="admin-transaction-management">
          <div className="um-no-access">
            <i className="fas fa-exclamation-triangle um-warning-icon"></i>
            <h2>Chưa đăng nhập</h2>
            <p>Vui lòng đăng nhập để truy cập trang này.</p>
            <a href="/login" className="pm-btn pm-btn-primary">
              <i className="fas fa-sign-in-alt"></i>
              Đăng nhập
            </a>
          </div>
        </div>
        <Footer />
      </>
    );
  }



  if (!hasRole('admin')) {
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
                Quản lý giao dịch
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
                  <option value="refunded">Đã hoàn tiền</option>
                </select>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '150px' }}>
                <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>Loại người dùng:</label>
                <select 
                  className="pm-filter-select" 
                  value={userTypeFilter} 
                  onChange={e => setUserTypeFilter(e.target.value)}
                >
                  <option value="all">Tất cả người dùng</option>
                  <option value="customer">Customer (1,2)</option>
                  <option value="shop">Shop (3,4)</option>
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
                  <option value="week">7 ngày qua</option>
                  <option value="month">30 ngày qua</option>
                  <option value="year">365 ngày qua</option>
                </select>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '200px', flex: 1 }}>
                <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>Tìm kiếm:</label>
                <input 
                  className="pm-search-input" 
                  type="text" 
                  placeholder="Tìm theo tên user, email, hoặc ID..." 
                  value={userFilter} 
                  onChange={e => setUserFilter(e.target.value)}
                />
              </div>
              
              <button 
                className="pm-btn pm-btn-primary" 
                onClick={fetchTransactions}
                disabled={loading}
                style={{ padding: '10px 16px' }}
              >
                <i className="fas fa-sync-alt"></i>
                {loading ? 'Đang tải...' : 'Làm mới'}
              </button>
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
                    <Tooltip formatter={(value) => [formatCurrency(value), 'Tổng tiền']} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#10b981" 
                      strokeWidth={3} 
                      dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }} 
                    />
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
            <h2>
              Danh sách giao dịch ({filteredTransactions.length}/{transactions.length})
            </h2>
            {loading ? (
              <div className="pm-loading-state">
                <div className="loading-spinner"></div>
                <p>Đang tải dữ liệu...</p>
              </div>
            ) : error ? (
              <div style={{ color: '#ef4444', textAlign: 'center', padding: '40px' }}>
                <i className="fas fa-exclamation-circle" style={{ fontSize: '48px', marginBottom: '16px' }}></i>
                <p>{error}</p>
                <button className="pm-btn pm-btn-primary" onClick={fetchTransactions} style={{ marginTop: '16px' }}>
                  <i className="fas fa-retry"></i>
                  Thử lại
                </button>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                <i className="fas fa-inbox" style={{ fontSize: '48px', marginBottom: '16px' }}></i>
                <p>Không có giao dịch nào phù hợp với bộ lọc</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="pm-products-table">
                  <thead>
                    <tr>
                      <th>ID Giao dịch</th>
                      <th>User</th>
                      <th>Loại User</th>
                      <th>Loại giao dịch</th>
                      <th>Số tiền</th>
                      <th>Trạng thái</th>
                      <th>Ngày giao dịch</th>
                      <th>Mô tả</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map(tx => {
                      const dateTime = formatDateTime(tx.createdAt || tx.transaction_date);
                      const userDisplayName = getUserDisplayName(tx.user_id);
                      const userType = getUserType(tx.user_id);
                      const userTypeDisplay = getUserTypeDisplay(tx.user_id);
                      
                      return (
                        <tr key={tx._id} className="pm-table-row">
                          <td>
                            <span className="transaction-id">
                              {tx.vnp_txn_ref || tx._id?.slice(-8) || 'N/A'}
                            </span>
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
                                {userDisplayName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div style={{ fontWeight: '600', color: '#1f2937' }}>
                                  {userDisplayName}
                                </div>
                                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                  ID: {tx.user_id?._id?.slice(-8) || 'N/A'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className={getUserTypeBadgeClass(userType)}>
                              {userTypeDisplay}
                            </span>
                          </td>
                          <td>
                            <span className={getTypeBadgeClass(tx.transaction_type)}>
                              {getTypeText(tx.transaction_type)}
                            </span>
                          </td>
                          <td>
                            <span className={`transaction-amount ${(tx.amount || 0) >= 0 ? 'positive' : 'negative'}`}>
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
                                {dateTime.date}
                              </div>
                              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                {dateTime.time}
                              </div>
                            </div>
                          </td>
                          <td>
                            <div style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {tx.description || 'Không có mô tả'}
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button 
                                className="pm-btn pm-btn-danger" 
                                disabled={tx.status === 'completed' || actionLoading} 
                                onClick={() => setDeleteId(tx._id)}
                                style={{ fontSize: '12px', padding: '6px 12px' }}
                                title={tx.status === 'completed' ? 'Không thể xóa giao dịch đã hoàn thành' : 'Xóa giao dịch'}
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                              <button 
                                className="pm-btn pm-btn-edit" 
                                disabled={actionLoading} 
                                onClick={() => openEdit(tx)}
                                style={{ fontSize: '12px', padding: '6px 12px' }}
                                title="Chỉnh sửa giao dịch"
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
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
                <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '8px' }}>
                  <strong>Lưu ý:</strong> Chỉ có thể xóa giao dịch có trạng thái "Đang chờ" hoặc "Thất bại".
                </p>
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
                  <label>ID Giao dịch:</label>
                  <input 
                    className="pm-form-input" 
                    value={editTx.vnp_txn_ref || editTx._id || 'N/A'} 
                    disabled 
                    style={{ background: '#f3f4f6', color: '#6b7280' }}
                  />
                </div>
                
                <div className="pm-form-group">
                  <label>Số tiền:</label>
                  <input 
                    className="pm-form-input" 
                    value={formatCurrency(editTx.amount)} 
                    disabled 
                    style={{ background: '#f3f4f6', color: '#6b7280' }}
                  />
                  <small style={{ color: '#6b7280', fontSize: '12px' }}>Số tiền không thể thay đổi</small>
                </div>
                
                <div className="pm-form-group">
                  <label>Loại giao dịch:</label>
                  <input 
                    className="pm-form-input" 
                    value={getTypeText(editTx.transaction_type)} 
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
                    <option value="refunded">Đã hoàn tiền</option>
                  </select>
                </div>
                
                <div className="pm-form-group">
                  <label>Mô tả:</label>
                  <textarea 
                    className="pm-form-input" 
                    name="description" 
                    value={editForm.description} 
                    onChange={handleEditChange}
                    rows="3"
                    placeholder="Nhập mô tả giao dịch..."
                  />
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