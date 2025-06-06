import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ImageWithFallback from '../components/ImageWithFallback.jsx';
import { useAuth } from '../context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import axios from 'axios';
import '../css/UserManagement.css';
import '../css/ImageWithFallback.css';

const UserManagement = () => {
  const { user, hasRole } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showUserDetailModal, setShowUserDetailModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    roles: { admin: 0, shop: 0, customer: 0 },
    recentRegistrations: 0
  });

  const [editForm, setEditForm] = useState({
    role_id: '',
    account_type: {
      type: 'customer',
      level: 'normal'
    }
  });

  const [imageLoadingStates, setImageLoadingStates] = useState({});

  // Add useRef for search input
  const searchInputRef = useRef(null);

  // Add useEffect for auto-focus
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // Check admin permission
  useEffect(() => {
    if (!hasRole('admin')) {
      toast.error('Bạn không có quyền truy cập trang này');
      return;
    }
    fetchUsers();
    fetchStats();
  }, [hasRole]);

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Phiên đăng nhập đã hết hạn');
        return;
      }

      const response = await axios.get('http://localhost:8080/reptitist/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data) {
        setUsers(response.data);
        setFilteredUsers(response.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      
      if (error.response?.status === 404) {
        toast.error('API endpoint chưa được tạo. Vui lòng tạo backend admin controller trước.');
      } else if (error.response?.status === 403) {
        toast.error('Bạn không có quyền truy cập');
      } else if (error.response?.status === 401) {
        toast.error('Phiên đăng nhập đã hết hạn');
      } else {
        toast.error('Không thể tải danh sách người dùng. Vui lòng kiểm tra kết nối server.');
      }
      
      setUsers([]);
      setFilteredUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get('http://localhost:8080/reptitist/admin/users/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Filter by date range
  const filterByDateRange = (users, dateFilter) => {
    if (dateFilter === 'all') return users;

    const now = new Date();
    const startDate = new Date();

    switch (dateFilter) {
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
        return users;
    }

    return users.filter(user => {
      const userDate = new Date(user.created_at);
      return userDate >= startDate;
    });
  };

  // Enhanced filter and search functionality
  useEffect(() => {
    let filtered = [...users];

    // Search filter - improved to search in more fields
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(user =>
        user.username.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        (user.fullname && user.fullname.toLowerCase().includes(searchLower)) ||
        user._id.toLowerCase().includes(searchLower) ||
        (user.phone_number && user.phone_number.includes(searchTerm))
      );
    }

    // Role filter
    if (filterRole !== 'all') {
      filtered = filtered.filter(user => user.role_id?.role_name === filterRole);
    }

    // Status filter
    if (filterStatus !== 'all') {
      const isActive = filterStatus === 'active';
      filtered = filtered.filter(user => user.isActive === isActive);
    }

    // Date filter
    filtered = filterByDateRange(filtered, filterDate);

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Handle nested properties
      if (sortField === 'role_name') {
        aValue = a.role_id?.role_name || '';
        bValue = b.role_id?.role_name || '';
      } else if (sortField === 'balance') {
        aValue = a.wallet?.balance || 0;
        bValue = b.wallet?.balance || 0;
      } else if (sortField === 'created_at') {
        aValue = new Date(a.created_at);
        bValue = new Date(b.created_at);
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [users, searchTerm, filterRole, filterStatus, filterDate, sortField, sortDirection]);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  // Handle sorting
  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Handle view user details
  const handleViewUserDetails = (userData) => {
    setSelectedUser(userData);
    setShowUserDetailModal(true);
  };

  // Handle edit user
  const handleEditUser = (userData) => {
    setSelectedUser(userData);
    setEditForm({
      role_id: userData.role_id?._id || '',
      account_type: {
        type: userData.account_type?.type || 'customer',
        level: userData.account_type?.level || 'normal'
      }
    });
    setShowEditModal(true);
  };

  // Handle save edit
  const handleSaveEdit = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Phiên đăng nhập đã hết hạn');
        return;
      }

      const response = await axios.put(
        `http://localhost:8080/reptitist/admin/users/${selectedUser._id}`,
        editForm,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 200) {
        toast.success('Cập nhật thông tin người dùng thành công');
        fetchUsers();
        fetchStats();
        setShowEditModal(false);
        setSelectedUser(null);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật thông tin');
    }
  };

  // Handle delete user
  const handleDeleteUser = (userData) => {
    setSelectedUser(userData);
    setShowDeleteModal(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Phiên đăng nhập đã hết hạn');
        return;
      }

      const response = await axios.delete(
        `http://localhost:8080/reptitist/admin/users/${selectedUser._id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.status === 200) {
        toast.success('Xóa người dùng thành công');
        fetchUsers();
        fetchStats();
        setShowDeleteModal(false);
        setSelectedUser(null);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi xóa người dùng');
    }
  };

  // Handle toggle user status
  const toggleUserStatus = async (userData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Phiên đăng nhập đã hết hạn');
        return;
      }

      const newStatus = !userData.isActive;
      const response = await axios.patch(
        `http://localhost:8080/reptitist/admin/users/${userData._id}/status`,
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
        fetchUsers();
        fetchStats();
      }
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast.error('Có lỗi xảy ra khi thay đổi trạng thái tài khoản');
    }
  };

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

  // Format date for display
  const formatDateOnly = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
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

  // Get role badge color
  const getRoleBadgeColor = (role_name) => {
    if (!role_name) return 'um-badge-default';
    switch (role_name.toLowerCase()) {
      case 'admin': return 'um-badge-admin';
      case 'shop': return 'um-badge-shop';
      case 'customer': return 'um-badge-customer';
      default: return 'um-badge-default';
    }
  };

  // Calculate user activity status
  const getUserActivityStatus = (user) => {
    const lastActivity = new Date(user.updated_at || user.created_at);
    const now = new Date();
    const daysDiff = Math.floor((now - lastActivity) / (1000 * 60 * 60 * 24));
    
    if (daysDiff <= 7) return 'active';
    if (daysDiff <= 30) return 'recent';
    return 'inactive';
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setFilterRole('all');
    setFilterStatus('all');
    setFilterDate('all');
    setCurrentPage(1);
  };

  // Render pagination
  const renderPagination = () => {
    const pages = [];
    const maxVisible = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    // First page
    if (startPage > 1) {
      pages.push(
        <button
          key="1"
          onClick={() => setCurrentPage(1)}
          className="um-pagination-btn"
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(
          <span key="start-dots" className="um-pagination-dots">...</span>
        );
      }
    }

    // Visible pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`um-pagination-btn ${currentPage === i ? 'active' : ''}`}
        >
          {i}
        </button>
      );
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="end-dots" className="um-pagination-dots">...</span>
        );
      }
      pages.push(
        <button
          key={totalPages}
          onClick={() => setCurrentPage(totalPages)}
          className="um-pagination-btn"
        >
          {totalPages}
        </button>
      );
    }

    return pages;
  };

  // Add image loading handler
  const handleImageLoad = (userId) => {
    setImageLoadingStates(prev => ({
      ...prev,
      [userId]: false
    }));
  };

  // Add image error handler
  const handleImageError = (userId) => {
    setImageLoadingStates(prev => ({
      ...prev,
      [userId]: false
    }));
  };

  // Add this function after the existing state declarations
  const getDefaultAvatar = (size) => {
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <circle fill="#E5E7EB" cx="${size/2}" cy="${size/2}" r="${size/2}"/>
        <circle fill="#9CA3AF" cx="${size/2}" cy="${size/2.35}" r="${size/5.7}"/>
        <path fill="#9CA3AF" d="M${size/2},${size/1.48} C${size/1.5},${size/1.48} ${size/1.25},${size/1.23} ${size/1.25},${size/1.025} L${size/1.25},${size} L${size/5},${size} L${size/5},${size/1.025} C${size/5},${size/1.23} ${size/3},${size/1.48} ${size/2},${size/1.48} Z"/>
      </svg>
    `)}`;
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
        {/* Enhanced Page Header */}
        <div className="um-page-header">
          <div className="um-page-header-content">
            <div className="um-page-header-text">
              <h1>
                <i className="fas fa-users-cog"></i>
                Quản lý người dùng
              </h1>
              <p>Quản lý tất cả người dùng trong hệ thống - Tìm kiếm, lọc và theo dõi hoạt động</p>
              <div className="um-header-breadcrumb">
                <Link to="/">Trang chủ</Link>
                <i className="fas fa-chevron-right"></i>
                <span>Quản lý người dùng</span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Statistics Dashboard */}
        <div className="um-stats-dashboard">
          <div className="um-stats-grid">
            <div className="um-stat-card um-stat-total">
              <div className="um-stat-icon">
                <i className="fas fa-users"></i>
              </div>
              <div className="um-stat-content">
                <span className="um-stat-number">{stats.total}</span>
                <span className="um-stat-label">Tổng người dùng</span>
                <span className="um-stat-change">+{stats.recentRegistrations} tuần này</span>
              </div>
            </div>
            
            <div className="um-stat-card um-stat-active">
              <div className="um-stat-icon">
                <i className="fas fa-check-circle"></i>
              </div>
              <div className="um-stat-content">
                <span className="um-stat-number">{stats.active}</span>
                <span className="um-stat-label">Đang hoạt động</span>
                <span className="um-stat-percentage">{stats.total ? Math.round((stats.active / stats.total) * 100) : 0}%</span>
              </div>
            </div>

            <div className="um-stat-card um-stat-inactive">
              <div className="um-stat-icon">
                <i className="fas fa-ban"></i>
              </div>
              <div className="um-stat-content">
                <span className="um-stat-number">{stats.inactive}</span>
                <span className="um-stat-label">Đã khóa</span>
                <span className="um-stat-percentage">{stats.total ? Math.round((stats.inactive / stats.total) * 100) : 0}%</span>
              </div>
            </div>

            <div className="um-stat-card um-stat-admin">
              <div className="um-stat-icon">
                <i className="fas fa-user-shield"></i>
              </div>
              <div className="um-stat-content">
                <span className="um-stat-number">{stats.roles.admin}</span>
                <span className="um-stat-label">Admin</span>
              </div>
            </div>

            <div className="um-stat-card um-stat-shop">
              <div className="um-stat-icon">
                <i className="fas fa-store"></i>
              </div>
              <div className="um-stat-content">
                <span className="um-stat-number">{stats.roles.shop}</span>
                <span className="um-stat-label">Cửa hàng</span>
              </div>
            </div>

            <div className="um-stat-card um-stat-customer">
              <div className="um-stat-icon">
                <i className="fas fa-user"></i>
              </div>
              <div className="um-stat-content">
                <span className="um-stat-number">{stats.roles.customer}</span>
                <span className="um-stat-label">Khách hàng</span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Filters and Search */}
        <div className="um-filters-section">
          <div className="um-filters-row">
            <div className="um-search-box">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Tìm kiếm theo tên, email, ID, số điện thoại..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="um-search-input"
              />
              <i className="fas fa-search um-search-icon"></i>
            </div>
            
            <div className="um-filter-group">
              <label>Vai trò:</label>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="um-filter-select"
              >
                <option value="all">Tất cả vai trò</option>
                <option value="admin">Admin</option>
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
              <label>Thời gian đăng ký:</label>
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
                <option value={100}>100 mục</option>
              </select>
            </div>

            <button
              onClick={resetFilters}
              className="um-btn um-btn-secondary um-reset-btn"
              title="Đặt lại bộ lọc"
            >
              <i className="fas fa-undo"></i>
              Đặt lại
            </button>
          </div>

          {/* Filter Summary */}
          {(searchTerm || filterRole !== 'all' || filterStatus !== 'all' || filterDate !== 'all') && (
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
                {filterRole !== 'all' && (
                  <span className="um-filter-tag">
                    <i className="fas fa-user-tag"></i>
                    {filterRole}
                    <button onClick={() => setFilterRole('all')}>×</button>
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

        {/* Enhanced Users Table */}
        <div className="um-table-section">
          {loading ? (
            <div className="um-loading-state">
              <div className="um-spinner"></div>
              <h3>Đang tải dữ liệu...</h3>
              <p>Vui lòng chờ trong giây lát</p>
            </div>
          ) : currentUsers.length === 0 ? (
            <div className="um-empty-state">
              <i className="fas fa-users-slash um-empty-icon"></i>
              <h3>Không tìm thấy người dùng</h3>
              <p>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
              <button onClick={resetFilters} className="um-btn um-btn-primary">
                <i className="fas fa-refresh"></i>
                Đặt lại bộ lọc
              </button>
            </div>
          ) : (
            <>
              <div className="um-table-header">
                <h3>
                  <i className="fas fa-table"></i>
                  Danh sách người dùng ({filteredUsers.length})
                </h3>
                <div className="um-table-actions">
                  <button 
                    onClick={() => window.location.reload()} 
                    className="um-btn um-btn-secondary"
                    title="Làm mới dữ liệu"
                  >
                    <i className="fas fa-sync-alt"></i>
                  </button>
                </div>
              </div>

              <div className="um-table-container">
                <table className="um-users-table">
                  <thead>
                    <tr>
                      <th onClick={() => handleSort('username')} className="um-sortable">
                        <span>Thông tin người dùng</span>
                        {sortField === 'username' && (
                          <i className={`fas fa-chevron-${sortDirection === 'asc' ? 'up' : 'down'}`}></i>
                        )}
                      </th>
                      <th onClick={() => handleSort('email')} className="um-sortable">
                        <span>Liên hệ</span>
                        {sortField === 'email' && (
                          <i className={`fas fa-chevron-${sortDirection === 'asc' ? 'up' : 'down'}`}></i>
                        )}
                      </th>
                      <th onClick={() => handleSort('role_name')} className="um-sortable">
                        <span>Vai trò</span>
                        {sortField === 'role_name' && (
                          <i className={`fas fa-chevron-${sortDirection === 'asc' ? 'up' : 'down'}`}></i>
                        )}
                      </th>
                      <th onClick={() => handleSort('balance')} className="um-sortable">
                        <span>Số dư ví</span>
                        {sortField === 'balance' && (
                          <i className={`fas fa-chevron-${sortDirection === 'asc' ? 'up' : 'down'}`}></i>
                        )}
                      </th>
                      <th onClick={() => handleSort('created_at')} className="um-sortable">
                        <span>Ngày đăng ký</span>
                        {sortField === 'created_at' && (
                          <i className={`fas fa-chevron-${sortDirection === 'asc' ? 'up' : 'down'}`}></i>
                        )}
                      </th>
                      <th>Trạng thái</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentUsers.map(userData => (
                      <tr 
                        key={userData._id} 
                        className={`${!userData.isActive ? 'um-inactive-row' : ''} um-table-row`}
                      >
                        <td>
                          <div className="um-user-info">
                            <div className="um-user-avatar-container">
                              <div className={`um-avatar-placeholder ${!imageLoadingStates[userData._id] ? 'hidden' : ''}`}>
                                <i className="fas fa-user"></i>
                              </div>
                              <img
                                src={userData.user_imageurl || getDefaultAvatar(48)}
                                alt={userData.username}
                                className={`um-user-avatar ${imageLoadingStates[userData._id] ? 'hidden' : ''}`}
                                loading="lazy"
                                onLoad={() => handleImageLoad(userData._id)}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = getDefaultAvatar(48);
                                  handleImageError(userData._id);
                                }}
                              />
                              <div className={`um-status-dot ${userData.isActive ? 'active' : 'inactive'}`}></div>
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
                          <div className="um-contact-info">
                            <div className="um-email">
                              <i className="fas fa-envelope"></i>
                              {userData.email}
                            </div>
                            {userData.phone_number && (
                              <div className="um-phone">
                                <i className="fas fa-phone"></i>
                                {userData.phone_number}
                              </div>
                            )}
                            {userData.address && (
                              <div className="um-address">
                                <i className="fas fa-map-marker-alt"></i>
                                {userData.address.length > 20 ? userData.address.substring(0, 20) + '...' : userData.address}
                              </div>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className={`um-role-badge ${getRoleBadgeColor(userData.role_id?.role_name)}`}>
                            <i className={`fas ${userData.role_id?.role_name === 'admin' ? 'fa-user-shield' : 
                                         userData.role_id?.role_name === 'shop' ? 'fa-store' : 'fa-user'}`}></i>
                            {userData.role_id?.role_name || 'N/A'}
                          </span>
                        </td>
                        <td>
                          <div className="um-balance-info">
                            <span className="um-balance">{formatCurrency(userData.wallet?.balance || 0)}</span>
                            <small className="um-account-type">
                              <i className={`fas ${userData.account_type?.level === 'premium' ? 'fa-crown' : 'fa-user'}`}></i>
                              {userData.account_type?.level || 'Normal'}
                            </small>
                          </div>
                        </td>
                        <td>
                          <div className="um-date-info">
                            <span className="um-date">
                              <i className="fas fa-calendar-plus"></i>
                              {formatDateOnly(userData.created_at)}
                            </span>
                            <small className="um-activity-status">
                              <i className={`fas ${getUserActivityStatus(userData) === 'active' ? 'fa-circle' : 
                                           getUserActivityStatus(userData) === 'recent' ? 'fa-clock' : 'fa-moon'}`}></i>
                              {getUserActivityStatus(userData) === 'active' ? 'Hoạt động gần đây' : 
                               getUserActivityStatus(userData) === 'recent' ? 'Hoạt động trong tháng' : 'Không hoạt động'}
                            </small>
                          </div>
                        </td>
                        <td>
                          <button
                            onClick={() => toggleUserStatus(userData)}
                            className={`um-status-btn ${userData.isActive ? 'um-status-active' : 'um-status-inactive'}`}
                            disabled={userData.role_id?.role_name === 'admin' && userData._id !== user?.id}
                            title={userData.isActive ? 'Khóa tài khoản' : 'Kích hoạt tài khoản'}
                          >
                            {userData.isActive ? (
                              <>
                                <i className="fas fa-check-circle"></i>
                                Hoạt động
                              </>
                            ) : (
                              <>
                                <i className="fas fa-ban"></i>
                                Đã khóa
                              </>
                            )}
                          </button>
                        </td>
                        <td>
                          <div className="um-action-buttons">
                            <button
                              onClick={() => handleViewUserDetails(userData)}
                              className="um-btn-action um-btn-view"
                              title="Xem chi tiết"
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            <button
                              onClick={() => handleEditUser(userData)}
                              className="um-btn-action um-btn-edit"
                              title="Chỉnh sửa"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button
                              onClick={() => handleDeleteUser(userData)}
                              className="um-btn-action um-btn-delete"
                              title="Xóa"
                              disabled={userData.role_id?.role_name === 'admin'}
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
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="um-pagination-btn"
                  >
                    <i className="fas fa-chevron-left"></i>
                  </button>
                  
                  {renderPagination()}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="um-pagination-btn"
                  >
                    <i className="fas fa-chevron-right"></i>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* User Detail Modal */}
      {showUserDetailModal && selectedUser && (
        <div className="um-modal-overlay">
          <div className="um-modal-content um-user-detail-modal">
            <div className="um-modal-header">
              <h2>Chi tiết người dùng</h2>
              <button onClick={() => setShowUserDetailModal(false)} className="um-modal-close">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="um-modal-body">
              <div className="um-user-profile">
                <div className="um-user-avatar-large">
                  <div className={`um-avatar-placeholder-large ${!imageLoadingStates[selectedUser._id] ? 'hidden' : ''}`}>
                    <i className="fas fa-user"></i>
                  </div>
                  <img
                    src={selectedUser.user_imageurl || getDefaultAvatar(150)}
                    alt={selectedUser.username}
                    className={`um-user-avatar-large ${imageLoadingStates[selectedUser._id] ? 'hidden' : ''}`}
                    loading="lazy"
                    onLoad={() => handleImageLoad(selectedUser._id)}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = getDefaultAvatar(150);
                      handleImageError(selectedUser._id);
                    }}
                  />
                </div>
                <div className="um-user-info-detailed">
                  <h3>{selectedUser.username}</h3>
                  <span className={`um-role-badge ${getRoleBadgeColor(selectedUser.role_id?.role_name)}`}>
                    {selectedUser.role_id?.role_name || 'N/A'}
                  </span>
                </div>
              </div>

              <div className="um-detail-sections">
                <div className="um-detail-section">
                  <h4><i className="fas fa-user"></i> Thông tin cá nhân</h4>
                  <div className="um-detail-grid">
                    <div className="um-detail-item">
                      <label>Họ và tên:</label>
                      <span>{selectedUser.fullname || 'N/A'}</span>
                    </div>
                    <div className="um-detail-item">
                      <label>Email:</label>
                      <span>{selectedUser.email}</span>
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
                      <span className={selectedUser.isActive ? 'um-status-active' : 'um-status-inactive'}>
                        {selectedUser.isActive ? 'Đang hoạt động' : 'Đã khóa'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="um-detail-section">
                  <h4><i className="fas fa-wallet"></i> Thông tin ví</h4>
                  <div className="um-detail-grid">
                    <div className="um-detail-item">
                      <label>Số dư hiện tại:</label>
                      <span className="um-balance">{formatCurrency(selectedUser.wallet?.balance || 0)}</span>
                    </div>
                    <div className="um-detail-item">
                      <label>Loại tài khoản:</label>
                      <span>{selectedUser.account_type?.level || 'Normal'}</span>
                    </div>
                  </div>
                </div>

                <div className="um-detail-section">
                  <h4><i className="fas fa-history"></i> Hoạt động gần đây</h4>
                  <div className="um-activity-list">
                    {selectedUser.last_activity ? (
                      <div className="um-activity-item">
                        <i className="fas fa-clock"></i>
                        <span>Hoạt động cuối: {formatDate(selectedUser.last_activity)}</span>
                      </div>
                    ) : (
                      <div className="um-activity-item">
                        <i className="fas fa-info-circle"></i>
                        <span>Chưa có hoạt động nào</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="um-modal-footer">
              <button
                onClick={() => handleEditUser(selectedUser)}
                className="um-btn um-btn-primary"
              >
                <i className="fas fa-edit"></i>
                Chỉnh sửa thông tin
              </button>
              <button
                onClick={() => toggleUserStatus(selectedUser)}
                className={`um-btn ${selectedUser.isActive ? 'um-btn-warning' : 'um-btn-success'}`}
                disabled={selectedUser.role_id?.role_name === 'admin' && selectedUser._id !== user?.id}
              >
                <i className={`fas ${selectedUser.isActive ? 'fa-ban' : 'fa-check'}`}></i>
                {selectedUser.isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
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
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="um-modal-overlay">
          <div className="um-modal-content um-edit-modal">
            <div className="um-modal-header">
              <h2>Chỉnh sửa thông tin người dùng</h2>
              <button onClick={() => setShowEditModal(false)} className="um-modal-close">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="um-modal-body">
              <form className="um-edit-form">
                <div className="um-form-group">
                  <label>Vai trò:</label>
                  <select
                    value={editForm.role_id}
                    onChange={(e) => setEditForm({...editForm, role_id: e.target.value})}
                    className="um-form-input"
                    disabled={selectedUser.role_id?.role_name === 'admin' && selectedUser._id !== user?.id}
                  >
                    <option value="">Chọn vai trò</option>
                    <option value="customer">Khách hàng</option>
                    <option value="shop">Cửa hàng</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="um-form-group">
                  <label>Loại tài khoản:</label>
                  <select
                    value={editForm.account_type.type}
                    onChange={(e) => setEditForm({
                      ...editForm, 
                      account_type: {...editForm.account_type, type: e.target.value}
                    })}
                    className="um-form-input"
                  >
                    <option value="customer">Khách hàng</option>
                    <option value="shop">Cửa hàng</option>
                  </select>
                </div>
                <div className="um-form-group">
                  <label>Cấp độ tài khoản:</label>
                  <select
                    value={editForm.account_type.level}
                    onChange={(e) => setEditForm({
                      ...editForm, 
                      account_type: {...editForm.account_type, level: e.target.value}
                    })}
                    className="um-form-input"
                  >
                    <option value="normal">Thường</option>
                    <option value="premium">Premium</option>
                  </select>
                </div>
              </form>
            </div>
            <div className="um-modal-footer">
              <button
                onClick={handleSaveEdit}
                className="um-btn um-btn-primary"
              >
                <i className="fas fa-save"></i>
                Lưu thay đổi
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                className="um-btn um-btn-secondary"
              >
                <i className="fas fa-times"></i>
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedUser && (
        <div className="um-modal-overlay">
          <div className="um-modal-content um-delete-modal">
            <div className="um-modal-header">
              <h2>Xác nhận xóa</h2>
              <button onClick={() => setShowDeleteModal(false)} className="um-modal-close">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="um-modal-body">
              <div className="um-delete-warning">
                <i className="fas fa-exclamation-triangle"></i>
                <p>Bạn có chắc chắn muốn xóa người dùng này?</p>
                <p className="um-delete-user-info">
                  {selectedUser.username} ({selectedUser.email})
                </p>
                <p className="um-delete-note">
                  Lưu ý: Hành động này không thể hoàn tác. Tất cả dữ liệu liên quan đến người dùng này sẽ bị xóa vĩnh viễn.
                </p>
              </div>
            </div>
            <div className="um-modal-footer">
              <button
                onClick={confirmDelete}
                className="um-btn um-btn-danger"
                disabled={selectedUser.role_id?.role_name === 'admin'}
              >
                <i className="fas fa-trash"></i>
                Xác nhận xóa
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="um-btn um-btn-secondary"
              >
                <i className="fas fa-times"></i>
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default UserManagement;