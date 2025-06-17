import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import axios from 'axios';
import '../css/UserManagement.css';
import { baseUrl } from '../config';

const UserManagement = () => {
  const { user, hasRole } = useAuth();
  const navigate = useNavigate();
  
  // State management
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAccountType, setFilterAccountType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  
  // Modal states
  const [showUserDetailModal, setShowUserDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAccountTypeModal, setShowAccountTypeModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [accountTypeForm, setAccountTypeForm] = useState({
    type: 'customer',
    level: 'normal',
    expires_at: ''
  });
  
  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    admin: 0,
    shop: 0,
    customer: 0
  });

  const searchInputRef = useRef(null);

  // Get account type display text
  const getAccountTypeDisplayText = (userData) => {
    if (!userData) return 'Customer';
    
    // Check role first for admin
    if (userData.role_id?.role_name === 'admin') {
      return 'Administrator';
    }
    
    // Check account_type for shop
    if (userData.account_type?.type === 'shop') {
      const level = userData.account_type?.level;
      if (level === 'premium') {
        return 'Premium Shop';
      } else {
        return 'Shop Partner';
      }
    }
    
    // Check account type level for customers
    if (userData.account_type?.level === 'premium') {
      return 'Premium Customer';
    }
    
    return 'Customer';
  };

  // Get account type badge color
  const getAccountTypeBadgeColor = (userData) => {
    if (!userData) return 'um-badge-default';
    
    // Admin
    if (userData.role_id?.role_name === 'admin') {
      return 'um-badge-admin';
    }
    
    // Shop
    if (userData.account_type?.type === 'shop') {
      return userData.account_type?.level === 'premium' ? 'um-badge-premium' : 'um-badge-shop';
    }
    
    // Customer
    if (userData.account_type?.level === 'premium') {
      return 'um-badge-premium';
    }
    
    return 'um-badge-customer';
  };

  // Check admin permission
  useEffect(() => {
    if (!hasRole('admin')) {
      toast.error('Bạn không có quyền truy cập trang này');
      navigate('/');
      return;
    }
    initializeData();
  }, [hasRole, navigate]);

  // Initialize data
  const initializeData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchUsers(),
        fetchStats()
      ]);
    } catch (error) {
      console.error('Error initializing data:', error);
      toast.error('Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  // Fetch users
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Phiên đăng nhập đã hết hạn');
        return;
      }

      const response = await axios.get(`${baseUrl}/reptitist/admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data) {
        setUsers(response.data);
        setFilteredUsers(response.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Không thể tải danh sách người dùng');
      setUsers([]);
      setFilteredUsers([]);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(`${baseUrl}/reptitist/admin/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data?.users) {
        setStats(response.data.users);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Handle toggle user status
  const toggleUserStatus = async (userData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const newStatus = !userData.isActive;
      const response = await axios.patch(
        `${baseUrl}/reptitist/admin/users/${userData._id}/status`,
        { isActive: newStatus },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 200) {
        toast.success(`${newStatus ? 'Kích hoạt' : 'Vô hiệu hóa'} tài khoản thành công`);
        await fetchUsers();
        await fetchStats();
      }
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast.error('Có lỗi xảy ra khi thay đổi trạng thái tài khoản');
    }
  };

  // Handle delete user
  const handleDeleteUser = (userData) => {
    setSelectedUser(userData);
    setShowDeleteModal(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!selectedUser) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.delete(
        `${baseUrl}/reptitist/admin/users/${selectedUser._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        toast.success('Xóa người dùng thành công');
        await fetchUsers();
        await fetchStats();
        setShowDeleteModal(false);
        setSelectedUser(null);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi xóa người dùng');
    }
  };

  // Filter and search logic
  useEffect(() => {
    let filtered = [...users];

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(user =>
        user.username.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        (user.fullname && user.fullname.toLowerCase().includes(searchLower))
      );
    }

    // Account type filter
    if (filterAccountType !== 'all') {
      filtered = filtered.filter(user => {
        if (filterAccountType === 'admin') {
          return user.role_id?.role_name === 'admin';
        } else if (filterAccountType === 'shop') {
          return user.account_type?.type === 'shop';
        } else if (filterAccountType === 'customer') {
          return user.role_id?.role_name !== 'admin' && user.account_type?.type !== 'shop';
        }
        return true;
      });
    }

    // Status filter
    if (filterStatus !== 'all') {
      const isActive = filterStatus === 'active';
      filtered = filtered.filter(user => user.isActive === isActive);
    }

    // Date filter
    if (filterDate !== 'all') {
      const now = new Date();
      const startDate = new Date();

      switch (filterDate) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(now.getMonth() - 3);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          break;
      }

      if (filterDate !== 'all') {
        filtered = filtered.filter(user => {
          const userDate = new Date(user.created_at);
          return userDate >= startDate;
        });
      }
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === 'created_at') {
        aValue = new Date(a.created_at);
        bValue = new Date(b.created_at);
      } else if (sortField === 'account_type') {
        aValue = getAccountTypeDisplayText(a);
        bValue = getAccountTypeDisplayText(b);
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [users, searchTerm, filterAccountType, filterStatus, filterDate, sortField, sortDirection]);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (typeof amount !== 'number') return '0 VNĐ';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setFilterAccountType('all');
    setFilterStatus('all');
    setFilterDate('all');
    setCurrentPage(1);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  // Handle account type update
  const handleAccountTypeUpdate = async () => {
    if (!selectedUser) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.patch(
        `${baseUrl}/reptitist/admin/users/${selectedUser._id}/account-type`,
        accountTypeForm,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 200) {
        toast.success('Cập nhật loại tài khoản thành công');
        await fetchUsers();
        setShowAccountTypeModal(false);
        setSelectedUser(null);
      }
    } catch (error) {
      console.error('Error updating account type:', error);
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật loại tài khoản');
    }
  };

  // Open account type modal
  const openAccountTypeModal = (userData) => {
    setSelectedUser(userData);
    setAccountTypeForm({
      type: userData.account_type?.type || 'customer',
      level: userData.account_type?.level || 'normal',
      expires_at: userData.account_type?.expires_at || ''
    });
    setShowAccountTypeModal(true);
  };

  // Check admin access
  if (!hasRole('admin')) {
    return (
      <>
        <Header />
        <div className="um-user-list-container">
          <div className="um-no-access">
            <i className="fas fa-exclamation-triangle um-warning-icon"></i>
            <h2>Không có quyền truy cập</h2>
            <p>Bạn không có quyền xem trang này. Chỉ có Admin mới có thể truy cập.</p>
            <Link to="/" className="um-btn um-btn-primary">
              <i className="fas fa-home"></i>
              Về trang chủ
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      
      <div className="um-user-list-container">
        {/* Page Header */}
        <div className="um-page-header">
          <div className="um-page-header-content">
            <div className="um-page-header-text">
              <h1>
                <i className="fas fa-users"></i>
                Quản lý người dùng
              </h1>
              <p>Quản lý tất cả người dùng trong hệ thống</p>
              <div className="um-header-breadcrumb">
                <Link to="/">Trang chủ</Link>
                <i className="fas fa-chevron-right"></i>
                <span>Quản lý người dùng</span>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Dashboard */}
        <div className="um-stats-dashboard">
          <div className="um-stats-grid">
            <div className="um-stat-card um-stat-total">
              <div className="um-stat-icon">
                <i className="fas fa-users"></i>
              </div>
              <div className="um-stat-content">
                <span className="um-stat-number">{stats.total}</span>
                <span className="um-stat-label">Tổng người dùng</span>
              </div>
            </div>
            
            <div className="um-stat-card um-stat-active">
              <div className="um-stat-icon">
                <i className="fas fa-user-check"></i>
              </div>
              <div className="um-stat-content">
                <span className="um-stat-number">{stats.active}</span>
                <span className="um-stat-label">Đang hoạt động</span>
                <span className="um-stat-percentage">
                  {stats.total ? Math.round((stats.active / stats.total) * 100) : 0}%
                </span>
              </div>
            </div>

            <div className="um-stat-card um-stat-inactive">
              <div className="um-stat-icon">
                <i className="fas fa-user-times"></i>
              </div>
              <div className="um-stat-content">
                <span className="um-stat-number">{stats.inactive}</span>
                <span className="um-stat-label">Đã khóa</span>
                <span className="um-stat-percentage">
                  {stats.total ? Math.round((stats.inactive / stats.total) * 100) : 0}%
                </span>
              </div>
            </div>

            <div className="um-stat-card um-stat-admin">
              <div className="um-stat-icon">
                <i className="fas fa-user-shield"></i>
              </div>
              <div className="um-stat-content">
                <span className="um-stat-number">{stats.roles?.admin || 0}</span>
                <span className="um-stat-label">Quản trị viên</span>
              </div>
            </div>

            <div className="um-stat-card um-stat-shop">
              <div className="um-stat-icon">
                <i className="fas fa-store"></i>
              </div>
              <div className="um-stat-content">
                <span className="um-stat-number">{stats.roles?.shop || 0}</span>
                <span className="um-stat-label">Cửa hàng</span>
              </div>
            </div>

            <div className="um-stat-card um-stat-customer">
              <div className="um-stat-icon">
                <i className="fas fa-user"></i>
              </div>
              <div className="um-stat-content">
                <span className="um-stat-number">{stats.roles?.customer || 0}</span>
                <span className="um-stat-label">Khách hàng</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="um-filters-section">
          <div className="um-filters-row">
            <div className="um-search-box">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Tìm kiếm theo tên, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="um-search-input"
              />
              <i className="fas fa-search um-search-icon"></i>
            </div>
            
            <div className="um-filter-group">
              <label>Loại tài khoản:</label>
              <select
                value={filterAccountType}
                onChange={(e) => setFilterAccountType(e.target.value)}
                className="um-filter-select"
              >
                <option value="all">Tất cả loại</option>
                <option value="admin">Quản trị viên</option>
                <option value="shop">Cửa hàng</option>
                <option value="customer">Khách hàng</option>
              </select>
            </div>
            
            <div className="um-filter-group">
              <label>Trạng thái:</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="um-filter-select"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Đang hoạt động</option>
                <option value="inactive">Đã khóa</option>
              </select>
            </div>

            <div className="um-filter-group">
              <label>Thời gian:</label>
              <select
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="um-filter-select"
              >
                <option value="all">Tất cả thời gian</option>
                <option value="today">Hôm nay</option>
                <option value="week">Tuần này</option>
                <option value="month">Tháng này</option>
                <option value="quarter">3 tháng qua</option>
                <option value="year">Năm nay</option>
              </select>
            </div>

            <div className="um-filter-group">
              <label>Hiển thị:</label>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="um-filter-select"
              >
                <option value={10}>10 mục</option>
                <option value={25}>25 mục</option>
                <option value={50}>50 mục</option>
              </select>
            </div>

            <button
              onClick={resetFilters}
              className="um-btn um-btn-secondary um-reset-btn"
            >
              <i className="fas fa-undo"></i>
              Đặt lại
            </button>
          </div>

          {/* Filter Summary */}
          {(searchTerm || filterAccountType !== 'all' || filterStatus !== 'all' || filterDate !== 'all') && (
            <div className="um-filter-summary">
              <div className="um-filter-results">
                <span>Hiển thị {filteredUsers.length} / {users.length} người dùng</span>
              </div>
              <div className="um-filter-tags">
                {searchTerm && (
                  <span className="um-filter-tag">
                    <i className="fas fa-search"></i>
                    "{searchTerm}"
                    <button onClick={() => setSearchTerm('')}>×</button>
                  </span>
                )}
                {filterAccountType !== 'all' && (
                  <span className="um-filter-tag">
                    <i className="fas fa-user-tag"></i>
                    {filterAccountType === 'admin' ? 'Quản trị viên' : 
                     filterAccountType === 'shop' ? 'Cửa hàng' : 'Khách hàng'}
                    <button onClick={() => setFilterAccountType('all')}>×</button>
                  </span>
                )}
                {filterStatus !== 'all' && (
                  <span className="um-filter-tag">
                    <i className="fas fa-toggle-on"></i>
                    {filterStatus === 'active' ? 'Hoạt động' : 'Đã khóa'}
                    <button onClick={() => setFilterStatus('all')}>×</button>
                  </span>
                )}
                {filterDate !== 'all' && (
                  <span className="um-filter-tag">
                    <i className="fas fa-calendar"></i>
                    {filterDate}
                    <button onClick={() => setFilterDate('all')}>×</button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Users Table */}
        <div className="um-table-section">
          {loading ? (
            <div className="um-loading-state">
              <div className="um-spinner"></div>
              <h3>Đang tải dữ liệu...</h3>
            </div>
          ) : currentUsers.length === 0 ? (
            <div className="um-empty-state">
              <i className="fas fa-users-slash um-empty-icon"></i>
              <h3>Không tìm thấy người dùng</h3>
              <p>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
            </div>
          ) : (
            <>
              <div className="um-table-header">
                <h3>
                  <i className="fas fa-table"></i>
                  Danh sách người dùng ({filteredUsers.length})
                </h3>
              </div>

              <div className="um-table-container">
                <table className="um-users-table">
                  <thead>
                    <tr>
                      <th>Người dùng</th>
                      <th>Email</th>
                      <th>Loại tài khoản</th>
                      <th>Trạng thái</th>
                      <th>Ngày tạo</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentUsers.map(userData => (
                      <tr key={userData._id} className="um-table-row">
                        <td>
                          <div className="um-user-info">
                            <div className="um-user-avatar-container">
                              <img
                                src={userData.user_imageurl || '/default-avatar.png'}
                                alt={userData.username}
                                className="um-user-avatar"
                                onError={(e) => {
                                  e.target.src = '/default-avatar.png';
                                }}
                              />
                            </div>
                            <div className="um-user-details">
                              <span className="um-username">{userData.username}</span>
                              <small className="um-user-id">ID: {userData._id.slice(-8)}</small>
                              {userData.fullname && (
                                <small className="um-fullname">{userData.fullname}</small>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="um-email">{userData.email}</span>
                        </td>
                        <td>
                          <div className="um-account-type">
                            <span className={`um-role-badge ${getAccountTypeBadgeColor(userData)}`}>
                              {getAccountTypeDisplayText(userData)}
                            </span>
                            {userData.account_type?.expires_at && (
                              <small className="um-expiry-date">
                                Hết hạn: {new Date(userData.account_type.expires_at).toLocaleDateString('vi-VN')}
                              </small>
                            )}
                          </div>
                        </td>
                        <td>
                          <button
                            onClick={() => toggleUserStatus(userData)}
                            className={`um-status-btn ${userData.isActive ? 'um-status-active' : 'um-status-inactive'}`}
                          >
                            <i className={`fas ${userData.isActive ? 'fa-check-circle' : 'fa-ban'}`}></i>
                            {userData.isActive ? 'Đang hoạt động' : 'Đã khóa'}
                          </button>
                        </td>
                        <td>
                          <div className="um-date-info">
                            <span className="um-date">
                              {new Date(userData.created_at).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="um-action-buttons">
                            <button
                              onClick={() => {
                                setSelectedUser(userData);
                                setShowUserDetailModal(true);
                              }}
                              className="um-btn-action um-btn-view"
                              title="Xem chi tiết"
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            <button
                              onClick={() => {
                                setSelectedUser(userData);
                                setShowDeleteModal(true);
                              }}
                              className="um-btn-action um-btn-delete"
                              title="Xóa"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="um-pagination">
                  <div className="um-pagination-info">
                    Hiển thị {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredUsers.length)} của {filteredUsers.length} người dùng
                  </div>
                  
                  <div className="um-pagination-controls">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="um-pagination-btn um-pagination-prev"
                    >
                      <i className="fas fa-chevron-left"></i>
                      Trước
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`um-pagination-btn ${currentPage === page ? 'active' : ''}`}
                      >
                        {page}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="um-pagination-btn um-pagination-next"
                    >
                      Sau
                      <i className="fas fa-chevron-right"></i>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* User Detail Modal */}
        {showUserDetailModal && selectedUser && (
          <div className="um-modal-overlay" onClick={() => setShowUserDetailModal(false)}>
            <div className="um-modal-content um-modal-large" onClick={(e) => e.stopPropagation()}>
              <div className="um-modal-header">
                <h3>
                  <i className="fas fa-user"></i>
                  Chi tiết người dùng
                </h3>
                <button 
                  onClick={() => setShowUserDetailModal(false)}
                  className="um-close-btn"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              
              <div className="um-modal-body">
                <div className="um-user-detail-container">
                  <div className="um-detail-header">
                    <div className="um-user-avatar-large">
                      <img
                        src={selectedUser.user_imageurl || '/images/default-avatar.png'}
                        alt={selectedUser.username}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/images/default-avatar.png';
                        }}
                      />
                    </div>
                    <div className="um-user-basic-info">
                      <h4>{selectedUser.username}</h4>
                      <p className="um-user-email">{selectedUser.email}</p>
                      <div className="um-user-badges">
                        <span className={`um-role-badge ${getAccountTypeBadgeColor(selectedUser)}`}>
                          {getAccountTypeDisplayText(selectedUser)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="um-detail-section">
                    <h4 className="um-section-title">
                      <i className="fas fa-info-circle"></i>
                      Thông tin cơ bản
                    </h4>
                    <div className="um-detail-grid">
                      <div className="um-detail-item">
                        <label>ID người dùng:</label>
                        <span className="um-user-id-copy">{selectedUser._id}</span>
                      </div>
                      <div className="um-detail-item">
                        <label>Tên đầy đủ:</label>
                        <span>{selectedUser.fullname || 'N/A'}</span>
                      </div>
                      <div className="um-detail-item">
                        <label>Số điện thoại:</label>
                        <span>{selectedUser.phone_number || 'N/A'}</span>
                      </div>
                      <div className="um-detail-item">
                        <label>Địa chỉ:</label>
                        <span>{selectedUser.address || 'N/A'}</span>
                      </div>
                      <div className="um-detail-item">
                        <label>Ngày đăng ký:</label>
                        <span>{formatDate(selectedUser.created_at)}</span>
                      </div>
                      <div className="um-detail-item">
                        <label>Trạng thái:</label>
                        <span className={`um-status-indicator ${selectedUser.isActive ? 'active' : 'inactive'}`}>
                          <i className={`fas ${selectedUser.isActive ? 'fa-check-circle' : 'fa-ban'}`}></i>
                          {selectedUser.isActive ? 'Đang hoạt động' : 'Đã khóa'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Account Type Details */}
                  {selectedUser.account_type?.type === 'shop' && (
                    <div className="um-detail-section">
                      <h4 className="um-section-title">
                        <i className="fas fa-store"></i>
                        Thông tin đối tác
                      </h4>
                      <div className="um-detail-grid">
                        <div className="um-detail-item">
                          <label>Loại đối tác:</label>
                          <span>{selectedUser.account_type?.level === 'premium' ? 'Premium Shop' : 'Shop Partner'}</span>
                        </div>
                        {selectedUser.account_type?.activated_at && (
                          <div className="um-detail-item">
                            <label>Ngày kích hoạt:</label>
                            <span>{formatDate(selectedUser.account_type.activated_at)}</span>
                          </div>
                        )}
                        {selectedUser.account_type?.expires_at && (
                          <div className="um-detail-item">
                            <label>Ngày hết hạn:</label>
                            <span>{formatDate(selectedUser.account_type.expires_at)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedUser.wallet && (
                    <div className="um-wallet-info">
                      <div className="um-wallet-balance">
                        <span className="um-balance-label">Số dư ví</span>
                        <span className="um-balance-amount">
                          {formatCurrency(selectedUser.wallet.balance || 0)}
                        </span>
                      </div>
                      <div className="um-wallet-currency">
                        <span className="um-currency-label">Tiền tệ:</span>
                        <span>{selectedUser.wallet.currency || 'VND'}</span>
                      </div>
                      <div className="um-wallet-updated">
                        <span className="um-updated-label">Cập nhật lần cuối:</span>
                        <span>{formatDate(selectedUser.wallet.last_updated)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="um-modal-footer">
                <div className="um-quick-actions">
                  <button
                    onClick={() => toggleUserStatus(selectedUser)}
                    className={`um-btn ${selectedUser.isActive ? 'um-btn-warning' : 'um-btn-success'}`}
                  >
                    <i className={`fas ${selectedUser.isActive ? 'fa-ban' : 'fa-check'}`}></i>
                    {selectedUser.isActive ? 'Khóa tài khoản' : 'Kích hoạt tài khoản'}
                  </button>
                  <button
                    onClick={() => setShowUserDetailModal(false)}
                    className="um-btn um-btn-secondary"
                  >
                    <i className="fas fa-times"></i>
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedUser && (
          <div className="um-modal-overlay" onClick={() => setShowDeleteModal(false)}>
            <div className="um-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="um-modal-header">
                <h3>
                  <i className="fas fa-exclamation-triangle"></i>
                  Xác nhận xóa người dùng
                </h3>
                <button 
                  onClick={() => setShowDeleteModal(false)}
                  className="um-close-btn"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              
              <div className="um-modal-body">
                <div className="um-warning-message">
                  <i className="fas fa-exclamation-triangle um-warning-icon"></i>
                  <p>
                    Bạn có chắc chắn muốn xóa người dùng <strong>{selectedUser.username}</strong> không?
                    <br />
                    <strong>Hành động này không thể hoàn tác!</strong>
                  </p>
                </div>
              </div>
              
              <div className="um-modal-footer">
                <button 
                  onClick={() => setShowDeleteModal(false)}
                  className="um-btn um-btn-secondary"
                >
                  <i className="fas fa-times"></i>
                  Hủy
                </button>
                <button 
                  onClick={confirmDelete}
                  className="um-btn um-btn-danger"
                >
                  <i className="fas fa-trash"></i>
                  Xóa người dùng
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Account Type Modal */}
        {showAccountTypeModal && selectedUser && (
          <div className="um-modal-overlay">
            <div className="um-modal">
              <div className="um-modal-header">
                <h3>Chỉnh sửa loại tài khoản</h3>
                <button 
                  className="um-modal-close"
                  onClick={() => setShowAccountTypeModal(false)}
                >
                  ×
                </button>
              </div>
              <div className="um-modal-body">
                <div className="um-form-group">
                  <label>Loại tài khoản:</label>
                  <select
                    value={accountTypeForm.type}
                    onChange={(e) => setAccountTypeForm({
                      ...accountTypeForm,
                      type: e.target.value
                    })}
                  >
                    <option value="customer">Customer</option>
                    <option value="premium">Premium</option>
                    <option value="vip">VIP</option>
                  </select>
                </div>
                <div className="um-form-group">
                  <label>Cấp độ:</label>
                  <select
                    value={accountTypeForm.level}
                    onChange={(e) => setAccountTypeForm({
                      ...accountTypeForm,
                      level: e.target.value
                    })}
                  >
                    <option value="normal">Normal</option>
                    <option value="silver">Silver</option>
                    <option value="gold">Gold</option>
                    <option value="platinum">Platinum</option>
                  </select>
                </div>
                <div className="um-form-group">
                  <label>Ngày hết hạn (tùy chọn):</label>
                  <input
                    type="datetime-local"
                    value={accountTypeForm.expires_at}
                    onChange={(e) => setAccountTypeForm({
                      ...accountTypeForm,
                      expires_at: e.target.value
                    })}
                  />
                </div>
              </div>
              <div className="um-modal-footer">
                <button 
                  className="um-btn um-btn-secondary"
                  onClick={() => setShowAccountTypeModal(false)}
                >
                  Hủy
                </button>
                <button 
                  className="um-btn um-btn-primary"
                  onClick={handleAccountTypeUpdate}
                >
                  Cập nhật
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <Footer />
    </>
  );
};

export default UserManagement;