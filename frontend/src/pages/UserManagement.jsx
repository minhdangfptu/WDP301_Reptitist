import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CreateUserModal from '../components/CreateUserModal';
import { useAuth } from '../context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import axios from 'axios';
import '../css/UserManagement.css';

const UserList = () => {
  const { user, hasRole } = useAuth();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
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
      
      // Set empty array instead of mock data
      setUsers([]);
      setFilteredUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter and search functionality
  useEffect(() => {
    let filtered = [...users];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.fullname && user.fullname.toLowerCase().includes(searchTerm.toLowerCase()))
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
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredUsers(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  }, [users, searchTerm, filterRole, filterStatus, sortField, sortDirection]);

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
        fetchUsers(); // Refresh the list
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
        fetchUsers(); // Refresh the list
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
        fetchUsers(); // Refresh the list
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
      day: '2-digit'
    });
  };

  // Format currency
  // Handle new user created
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
              <p>Quản lý tất cả người dùng trong hệ thống</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="um-btn um-btn-primary um-create-user-btn"
            >
              <i className="fas fa-plus"></i>
              Tạo người dùng mới
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="um-filters-section">
          <div className="um-filters-row">
            <div className="um-search-box">
              <input
                type="text"
                placeholder="Tìm kiếm theo tên, email..."
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
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Đang hoạt động</option>
                <option value="inactive">Đã khóa</option>
              </select>
            </div>
          </div>

          <div className="um-stats-row">
            <div className="um-stat-item">
              <span className="um-stat-number">{filteredUsers.length}</span>
              <span className="um-stat-label">Tổng số người dùng</span>
            </div>
            <div className="um-stat-item">
              <span className="um-stat-number">
                {filteredUsers.filter(u => u.isActive).length}
              </span>
              <span className="um-stat-label">Đang hoạt động</span>
            </div>
            <div className="um-stat-item">
              <span className="um-stat-number">
                {filteredUsers.filter(u => u.role?.role_name === 'shop').length}
              </span>
              <span className="um-stat-label">Cửa hàng</span>
            </div>
          </div>
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
            </div>
          ) : (
            <div className="um-table-container">
              <table className="um-users-table">
                <thead>
                  <tr>
                    <th onClick={() => handleSort('username')}>
                      Tên đăng nhập
                      {sortField === 'username' && (
                        <i className={`fas fa-chevron-${sortDirection === 'asc' ? 'up' : 'down'}`}></i>
                      )}
                    </th>
                    <th onClick={() => handleSort('email')}>
                      Email
                      {sortField === 'email' && (
                        <i className={`fas fa-chevron-${sortDirection === 'asc' ? 'up' : 'down'}`}></i>
                      )}
                    </th>
                    <th onClick={() => handleSort('fullname')}>
                      Tên đầy đủ
                      {sortField === 'fullname' && (
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
                      Ngày tạo
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
                          <span className="um-username">{userData.username}</span>
                        </div>
                      </td>
                      <td>{userData.email}</td>
                      <td>{userData.fullname || 'Chưa cập nhật'}</td>
                      <td>
                        <span className={`um-role-badge ${getRoleBadgeColor(userData.role?.role_name)}`}>
                          {userData.role?.role_name || 'N/A'}
                        </span>
                      </td>
                      <td>{formatCurrency(userData.wallet?.balance || 0)}</td>
                      <td>{formatDate(userData.created_at)}</td>
                      <td>
                        <button
                          onClick={() => toggleUserStatus(userData)}
                          className={`um-status-btn ${userData.isActive ? 'um-status-active' : 'um-status-inactive'}`}
                        >
                          {userData.isActive ? 'Hoạt động' : 'Đã khóa'}
                        </button>
                      </td>
                      <td>
                        <div className="um-action-buttons">
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="um-pagination">
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
                return null;
              })}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="um-pagination-btn"
              >
                Sau
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="um-modal-overlay">
          <div className="um-modal-content">
            <div className="um-modal-header">
              <h3>Chỉnh sửa thông tin người dùng</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="um-close-btn"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="um-modal-body">
              <div className="um-form-row">
                <div className="um-form-group">
                  <label>Tên đăng nhập *</label>
                  <input
                    type="text"
                    value={editForm.username}
                    onChange={(e) => setEditForm(prev => ({...prev, username: e.target.value}))}
                    className="um-form-input"
                  />
                </div>
                <div className="um-form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm(prev => ({...prev, email: e.target.value}))}
                    className="um-form-input"
                  />
                </div>
              </div>
              
              <div className="um-form-row">
                <div className="um-form-group">
                  <label>Tên đầy đủ</label>
                  <input
                    type="text"
                    value={editForm.fullname}
                    onChange={(e) => setEditForm(prev => ({...prev, fullname: e.target.value}))}
                    className="um-form-input"
                  />
                </div>
                <div className="um-form-group">
                  <label>Số điện thoại</label>
                  <input
                    type="tel"
                    value={editForm.phone_number}
                    onChange={(e) => setEditForm(prev => ({...prev, phone_number: e.target.value}))}
                    className="um-form-input"
                  />
                </div>
              </div>
              
              <div className="um-form-group">
                <label>Địa chỉ</label>
                <textarea
                  value={editForm.address}
                  onChange={(e) => setEditForm(prev => ({...prev, address: e.target.value}))}
                  className="um-form-input"
                  rows="3"
                />
              </div>
              
              <div className="um-form-row">
                <div className="um-form-group">
                  <label>Vai trò</label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm(prev => ({...prev, role: e.target.value}))}
                    className="um-form-input"
                  >
                    <option value="customer">Customer</option>
                    <option value="shop">Shop</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="um-form-group">
                  <label>Trạng thái</label>
                  <select
                    value={editForm.isActive}
                    onChange={(e) => setEditForm(prev => ({...prev, isActive: e.target.value === 'true'}))}
                    className="um-form-input"
                  >
                    <option value={true}>Hoạt động</option>
                    <option value={false}>Đã khóa</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="um-modal-footer">
              <button
                onClick={() => setShowEditModal(false)}
                className="um-btn um-btn-secondary"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveEdit}
                className="um-btn um-btn-primary"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="um-modal-overlay">
          <div className="um-modal-content">
            <div className="um-modal-header">
              <h3>Xác nhận xóa người dùng</h3>
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
                  Bạn có chắc chắn muốn xóa người dùng <strong>{selectedUser?.username}</strong>?
                </p>
                <p className="um-warning-text">
                  Hành động này không thể hoàn tác và sẽ xóa toàn bộ dữ liệu của người dùng.
                </p>
              </div>
            </div>
            
            <div className="um-modal-footer">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="um-btn um-btn-secondary"
              >
                Hủy
              </button>
              <button
                onClick={confirmDelete}
                className="um-btn um-btn-danger"
              >
                Xóa người dùng
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default UserList;