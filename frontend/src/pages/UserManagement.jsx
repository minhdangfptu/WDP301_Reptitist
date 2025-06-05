import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CreateUserModal from '../components/CreateUserModal';
import { useAuth } from '../context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import axios from 'axios';
import '../css/UserManagement.css';

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
  const [showCreateModal, setShowCreateModal] = useState(false);
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
    username: '',
    email: '',
    fullname: '',
    phone_number: '',
    address: '',
    isActive: true,
    role: 'customer'
  });

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
      filtered = filtered.filter(user => user.role?.role_name === filterRole);
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
      if (sortField === 'role') {
        aValue = a.role?.role_name || '';
        bValue = b.role?.role_name || '';
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
      username: userData.username || '',
      email: userData.email || '',
      fullname: userData.fullname || '',
      phone_number: userData.phone_number || '',
      address: userData.address || '',
      isActive: userData.isActive !== false,
      role: userData.role?.role_name || 'customer'
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

      // Validate form
      if (!editForm.username.trim() || !editForm.email.trim()) {
        toast.error('Tên đăng nhập và email không được để trống');
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

  // Handle create user success
  const handleCreateUserSuccess = () => {
    fetchUsers();
    fetchStats();
    setShowCreateModal(false);
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
  const getRoleBadgeColor = (role) => {
    switch (role) {
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

  // Check admin access
  if (!hasRole('admin')) {
    return (
      <>
        <Header />
        <div className="um-user-list-container">
          <div className="um-no-access">
            <h2>Không có quyền truy cập</h2>
            <p>Bạn không có quyền xem trang này</p>
            <Link to="/" className="um-btn um-btn-primary">Về trang chủ</Link>
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
              <h1>Quản lý người dùng</h1>
              <p>Quản lý tất cả người dùng trong hệ thống - Tìm kiếm, lọc và theo dõi hoạt động</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="um-btn um-btn-primary um-create-user-btn"
            >
              <i className="fas fa-user-plus"></i>
              Tạo người dùng mới
            </button>
          </div>
        </div>

        {/* Enhanced Filters and Search */}
        <div className="um-filters-section">
          <div className="um-filters-row">
            <div className="um-search-box">
              <input
                type="text"
                placeholder="Tìm kiếm theo tên, email, ID, số điện thoại..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="um-search-input"
              />
              <i className="fas fa-search um-search-icon"></i>
            </div>
            
            <div className="um-filter-group">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="um-filter-select"
                title="Lọc theo vai trò"
              >
                <option value="all">Tất cả vai trò</option>
                <option value="admin">Admin</option>
                <option value="shop">Shop</option>
                <option value="customer">Customer</option>
              </select>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="um-filter-select"
                title="Lọc theo trạng thái"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Đang hoạt động</option>
                <option value="inactive">Đã khóa</option>
              </select>

              <select
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="um-filter-select"
                title="Lọc theo thời gian đăng ký"
              >
                <option value="all">Tất cả thời gian</option>
                <option value="today">Hôm nay</option>
                <option value="week">Tuần này</option>
                <option value="month">Tháng này</option>
                <option value="quarter">3 tháng qua</option>
                <option value="year">Năm nay</option>
              </select>

              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="um-filter-select"
                title="Số mục trên trang"
              >
                <option value={10}>10/trang</option>
                <option value={25}>25/trang</option>
                <option value={50}>50/trang</option>
                <option value={100}>100/trang</option>
              </select>

              <button
                onClick={resetFilters}
                className="um-btn um-btn-secondary"
                title="Đặt lại bộ lọc"
              >
                <i className="fas fa-undo"></i>
                Reset
              </button>
            </div>
          </div>

          {/* Enhanced Statistics */}
          <div className="um-stats-row">
            <div className="um-stat-item">
              <span className="um-stat-number">{stats.total}</span>
              <span className="um-stat-label">Tổng người dùng</span>
            </div>
            <div className="um-stat-item">
              <span className="um-stat-number">{stats.active}</span>
              <span className="um-stat-label">Đang hoạt động</span>
            </div>
            <div className="um-stat-item">
              <span className="um-stat-number">{stats.inactive}</span>
              <span className="um-stat-label">Đã khóa</span>
            </div>
            <div className="um-stat-item">
              <span className="um-stat-number">{stats.roles.admin}</span>
              <span className="um-stat-label">Admin</span>
            </div>
            <div className="um-stat-item">
              <span className="um-stat-number">{stats.roles.shop}</span>
              <span className="um-stat-label">Cửa hàng</span>
            </div>
            <div className="um-stat-item">
              <span className="um-stat-number">{stats.roles.customer}</span>
              <span className="um-stat-label">Khách hàng</span>
            </div>
            <div className="um-stat-item">
              <span className="um-stat-number">{stats.recentRegistrations}</span>
              <span className="um-stat-label">Đăng ký gần đây</span>
            </div>
          </div>

          {/* Filter Summary */}
          {(searchTerm || filterRole !== 'all' || filterStatus !== 'all' || filterDate !== 'all') && (
            <div className="um-filter-summary">
              <span>Hiển thị {filteredUsers.length} / {users.length} người dùng</span>
              {searchTerm && <span className="um-filter-tag">Tìm kiếm: "{searchTerm}"</span>}
              {filterRole !== 'all' && <span className="um-filter-tag">Vai trò: {filterRole}</span>}
              {filterStatus !== 'all' && <span className="um-filter-tag">Trạng thái: {filterStatus}</span>}
              {filterDate !== 'all' && <span className="um-filter-tag">Thời gian: {filterDate}</span>}
            </div>
          )}
        </div>

        {/* Users Table */}
        <div className="um-table-section">
          {loading ? (
            <div className="um-loading-state">
              <div className="um-spinner"></div>
              <p>Đang tải dữ liệu...</p>
            </div>
          ) : currentUsers.length === 0 ? (
            <div className="um-empty-state">
              <i className="fas fa-users um-empty-icon"></i>
              <h3>Không tìm thấy người dùng</h3>
              <p>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
              <button onClick={resetFilters} className="um-btn um-btn-primary">
                Đặt lại bộ lọc
              </button>
            </div>
          ) : (
            <div className="um-table-container">
              <table className="um-users-table">
                <thead>
                  <tr>
                    <th onClick={() => handleSort('username')}>
                      Thông tin người dùng
                      {sortField === 'username' && (
                        <i className={`fas fa-chevron-${sortDirection === 'asc' ? 'up' : 'down'}`}></i>
                      )}
                    </th>
                    <th onClick={() => handleSort('email')}>
                      Liên hệ
                      {sortField === 'email' && (
                        <i className={`fas fa-chevron-${sortDirection === 'asc' ? 'up' : 'down'}`}></i>
                      )}
                    </th>
                    <th onClick={() => handleSort('role')}>
                      Vai trò
                      {sortField === 'role' && (
                        <i className={`fas fa-chevron-${sortDirection === 'asc' ? 'up' : 'down'}`}></i>
                      )}
                    </th>
                    <th onClick={() => handleSort('balance')}>
                      Số dư ví
                      {sortField === 'balance' && (
                        <i className={`fas fa-chevron-${sortDirection === 'asc' ? 'up' : 'down'}`}></i>
                      )}
                    </th>
                    <th onClick={() => handleSort('created_at')}>
                      Ngày đăng ký
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
                    <tr key={userData._id} className={!userData.isActive ? 'um-inactive-row' : ''}>
                      <td>
                        <div className="um-user-info">
                          <img
                            src={userData.user_imageurl || "/api/placeholder/40/40"}
                            alt={userData.username}
                            className="um-user-avatar"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "/api/placeholder/40/40";
                            }}
                          />
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
                          <div className="um-email">{userData.email}</div>
                          {userData.phone_number && (
                            <div className="um-phone">{userData.phone_number}</div>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={`um-role-badge ${getRoleBadgeColor(userData.role?.role_name)}`}>
                          {userData.role?.role_name || 'N/A'}
                        </span>
                      </td>
                      <td>
                        <div className="um-balance-info">
                          <span className="um-balance">{formatCurrency(userData.wallet?.balance || 0)}</span>
                          <small className="um-account-type">
                            {userData.account_type?.level || 'Normal'}
                          </small>
                        </div>
                      </td>
                      <td>
                        <div className="um-date-info">
                          <span className="um-date">{formatDateOnly(userData.created_at)}</span>
                          <small className="um-activity-status">
                            Hoạt động: {getUserActivityStatus(userData) === 'active' ? 'Gần đây' : 
                                     getUserActivityStatus(userData) === 'recent' ? 'Trong tháng' : 'Lâu rồi'}
                          </small>
                        </div>
                      </td>
                      <td>
                        <button
                          onClick={() => toggleUserStatus(userData)}
                          className={`um-status-btn ${userData.isActive ? 'um-status-active' : 'um-status-inactive'}`}
                          disabled={userData.role?.role_name === 'admin' && userData._id !== user?.id}
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
                            disabled={userData.role?.role_name === 'admin'}
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
          )}

          {/* Enhanced Pagination */}
          {totalPages > 1 && (
            <div className="um-pagination">
              <div className="um-pagination-info">
                Hiển thị {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredUsers.length)} của {filteredUsers.length} mục
              </div>
              
              <div className="um-pagination-controls">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="um-pagination-btn"
                  title="Trang đầu"
                >
                  <i className="fas fa-angle-double-left"></i>
                </button>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="um-pagination-btn"
                >
                  <i className="fas fa-chevron-left"></i>
                  Trước
                </button>
                
                {[...Array(totalPages)].map((_, index) => {
                  const page = index + 1;
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 2 && page <= currentPage + 2)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`um-pagination-btn ${currentPage === page ? 'active' : ''}`}
                      >
                        {page}
                      </button>
                    );
                  } else if (
                    page === currentPage - 3 ||
                    page === currentPage + 3
                  ) {
                    return <span key={page} className="um-pagination-dots">...</span>;
                  }