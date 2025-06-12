import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import axios from 'axios';
import '../css/UserManagement.css';

const AdminShopManagement = () => {
  const { user, hasRole } = useAuth();
  const navigate = useNavigate();
  
  // State management
  const [shops, setShops] = useState([]);
  const [filteredShops, setFilteredShops] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [activeTab, setActiveTab] = useState('shops'); // 'shops' or 'reports'
  
  // Modal states
  const [showShopDetailModal, setShowShopDetailModal] = useState(false);
  const [showProductsModal, setShowProductsModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedShop, setSelectedShop] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [shopProducts, setShopProducts] = useState([]);
  const [adminNote, setAdminNote] = useState('');
  
  // Statistics
  const [stats, setStats] = useState({
    users: {
      total: 0,
      active: 0,
      inactive: 0,
      roles: { admin: 0, shop: 0, customer: 0 }
    },
    products: {
      total: 0,
      available: 0,
      reported: 0,
      notAvailable: 0
    },
    reports: {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      recent: 0
    }
  });

  const searchInputRef = useRef(null);

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
        fetchShops(),
        fetchReports(),
        fetchStats()
      ]);
    } catch (error) {
      console.error('Error initializing data:', error);
      toast.error('Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  // Fetch shops
  const fetchShops = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Phiên đăng nhập đã hết hạn');
        return;
      }

      const response = await axios.get('http://localhost:8080/reptitist/admin/shops', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data?.shops) {
        setShops(response.data.shops);
        setFilteredShops(response.data.shops);
      }
    } catch (error) {
      console.error('Error fetching shops:', error);
      toast.error('Không thể tải danh sách shop');
      setShops([]);
      setFilteredShops([]);
    }
  };

  // Fetch reports
  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get('http://localhost:8080/reptitist/admin/reports', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data?.reports) {
        setReports(response.data.reports);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      setReports([]);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get('http://localhost:8080/reptitist/admin/stats', {
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

  // Fetch shop products
  const fetchShopProducts = async (shopId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(`http://localhost:8080/reptitist/admin/shops/${shopId}/products`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data?.products) {
        setShopProducts(response.data.products);
      }
    } catch (error) {
      console.error('Error fetching shop products:', error);
      toast.error('Không thể tải sản phẩm của shop');
      setShopProducts([]);
    }
  };

  // Handle delete product by admin
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.delete(
        `http://localhost:8080/reptitist/admin/products/${productId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.status === 200) {
        toast.success('Xóa sản phẩm thành công');
        // Refresh shop products
        if (selectedShop) {
          await fetchShopProducts(selectedShop._id);
        }
        await fetchStats();
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Có lỗi xảy ra khi xóa sản phẩm');
    }
  };

  // Handle report action
  const handleReportAction = async (reportId, action, note = '') => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.post(
        `http://localhost:8080/reptitist/admin/reports/${reportId}/handle`,
        {
          action, // 'approve' or 'reject'
          adminNote: note
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 200) {
        toast.success(`${action === 'approve' ? 'Chấp nhận' : 'Từ chối'} báo cáo thành công`);
        await fetchReports();
        await fetchStats();
        setShowReportModal(false);
        setSelectedReport(null);
        setAdminNote('');
      }
    } catch (error) {
      console.error('Error handling report:', error);
      toast.error('Có lỗi xảy ra khi xử lý báo cáo');
    }
  };

  // Handle toggle shop status
  const toggleShopStatus = async (shopData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const newStatus = !shopData.isActive;
      const response = await axios.patch(
        `http://localhost:8080/reptitist/admin/users/${shopData._id}/status`,
        { isActive: newStatus },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 200) {
        toast.success(`${newStatus ? 'Kích hoạt' : 'Vô hiệu hóa'} shop thành công`);
        await fetchShops();
        await fetchStats();
      }
    } catch (error) {
      console.error('Error toggling shop status:', error);
      toast.error('Có lỗi xảy ra khi thay đổi trạng thái shop');
    }
  };

  // Filter and search logic
  useEffect(() => {
    let filtered = [...shops];

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(shop =>
        shop.username.toLowerCase().includes(searchLower) ||
        shop.email.toLowerCase().includes(searchLower) ||
        (shop.fullname && shop.fullname.toLowerCase().includes(searchLower))
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      const isActive = filterStatus === 'active';
      filtered = filtered.filter(shop => shop.isActive === isActive);
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
        filtered = filtered.filter(shop => {
          const shopDate = new Date(shop.created_at);
          return shopDate >= startDate;
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
      } else if (sortField === 'productCount') {
        aValue = a.productCount || 0;
        bValue = b.productCount || 0;
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredShops(filtered);
    setCurrentPage(1);
  }, [shops, searchTerm, filterStatus, filterDate, sortField, sortDirection]);

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

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'available': return 'um-badge-customer';
      case 'reported': return 'um-badge-admin';
      case 'not_available': return 'um-badge-default';
      default: return 'um-badge-default';
    }
  };

  // Get report status badge color
  const getReportStatusBadgeColor = (status) => {
    switch (status) {
      case 'pending': return 'um-badge-admin';
      case 'approved': return 'um-badge-customer';
      case 'rejected': return 'um-badge-default';
      default: return 'um-badge-default';
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentShops = filteredShops.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredShops.length / itemsPerPage);

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
    setFilterDate('all');
    setCurrentPage(1);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
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
                <i className="fas fa-store-alt"></i>
                Quản lý Shop & Báo cáo
              </h1>
              <p>Quản lý các cửa hàng và xử lý báo cáo sản phẩm</p>
              <div className="um-header-breadcrumb">
                <Link to="/">Trang chủ</Link>
                <i className="fas fa-chevron-right"></i>
                <span>Quản lý Shop</span>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Dashboard */}
        <div className="um-stats-dashboard">
          <div className="um-stats-grid">
            <div className="um-stat-card um-stat-shop">
              <div className="um-stat-icon">
                <i className="fas fa-store"></i>
              </div>
              <div className="um-stat-content">
                <span className="um-stat-number">{stats.users.roles.shop}</span>
                <span className="um-stat-label">Tổng Shop</span>
              </div>
            </div>
            
            <div className="um-stat-card um-stat-total">
              <div className="um-stat-icon">
                <i className="fas fa-box"></i>
              </div>
              <div className="um-stat-content">
                <span className="um-stat-number">{stats.products.total}</span>
                <span className="um-stat-label">Tổng sản phẩm</span>
              </div>
            </div>

            <div className="um-stat-card um-stat-active">
              <div className="um-stat-icon">
                <i className="fas fa-check-circle"></i>
              </div>
              <div className="um-stat-content">
                <span className="um-stat-number">{stats.products.available}</span>
                <span className="um-stat-label">Đang bán</span>
              </div>
            </div>

            <div className="um-stat-card um-stat-admin">
              <div className="um-stat-icon">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <div className="um-stat-content">
                <span className="um-stat-number">{stats.products.reported}</span>
                <span className="um-stat-label">Bị báo cáo</span>
              </div>
            </div>

            <div className="um-stat-card um-stat-inactive">
              <div className="um-stat-icon">
                <i className="fas fa-flag"></i>
              </div>
              <div className="um-stat-content">
                <span className="um-stat-number">{stats.reports.pending}</span>
                <span className="um-stat-label">Báo cáo chờ xử lý</span>
              </div>
            </div>

            <div className="um-stat-card um-stat-customer">
              <div className="um-stat-icon">
                <i className="fas fa-clock"></i>
              </div>
              <div className="um-stat-content">
                <span className="um-stat-number">{stats.reports.recent}</span>
                <span className="um-stat-label">Báo cáo tuần này</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="um-filters-section" style={{ marginBottom: '10px', paddingBottom: '10px' }}>
          <div className="um-filters-row" style={{ justifyContent: 'flex-start', gap: '20px' }}>
            <button
              className={`um-btn ${activeTab === 'shops' ? 'um-btn-primary' : 'um-btn-secondary'}`}
              onClick={() => setActiveTab('shops')}
              style={{ 
                minWidth: '200px',
                borderRadius: '25px',
                fontWeight: '600'
              }}
            >
              <i className="fas fa-store"></i>
              Quản lý Shop ({filteredShops.length})
            </button>
            <button
              className={`um-btn ${activeTab === 'reports' ? 'um-btn-primary' : 'um-btn-secondary'}`}
              onClick={() => setActiveTab('reports')}
              style={{ 
                minWidth: '200px',
                borderRadius: '25px',
                fontWeight: '600'
              }}
            >
              <i className="fas fa-flag"></i>
              Báo cáo sản phẩm ({reports.filter(r => r.status === 'pending').length})
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'shops' ? (
          // Shops Management Tab
          <>
            {/* Filters and Search */}
            <div className="um-filters-section">
              <div className="um-filters-row">
                <div className="um-search-box">
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Tìm kiếm shop theo tên, email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="um-search-input"
                  />
                  <i className="fas fa-search um-search-icon"></i>
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
              {(searchTerm || filterStatus !== 'all' || filterDate !== 'all') && (
                <div className="um-filter-summary">
                  <div className="um-filter-results">
                    <span>Hiển thị {filteredShops.length} / {shops.length} shop</span>
                  </div>
                  <div className="um-filter-tags">
                    {searchTerm && (
                      <span className="um-filter-tag">
                        <i className="fas fa-search"></i>
                        "{searchTerm}"
                        <button onClick={() => setSearchTerm('')}>×</button>
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

            {/* Shops Table */}
            <div className="um-table-section">
              {loading ? (
                <div className="um-loading-state">
                  <div className="um-spinner"></div>
                  <h3>Đang tải dữ liệu...</h3>
                </div>
              ) : currentShops.length === 0 ? (
                <div className="um-empty-state">
                  <i className="fas fa-store-slash um-empty-icon"></i>
                  <h3>Không tìm thấy shop</h3>
                  <p>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                </div>
              ) : (
                <>
                  <div className="um-table-header">
                    <h3>
                      <i className="fas fa-table"></i>
                      Danh sách Shop ({filteredShops.length})
                    </h3>
                  </div>

                  <div className="um-table-container">
                    <table className="um-users-table">
                      <thead>
                        <tr>
                          <th>Thông tin Shop</th>
                          <th>Liên hệ</th>
                          <th>Số sản phẩm</th>
                          <th>Báo cáo</th>
                          <th>Ngày đăng ký</th>
                          <th>Trạng thái</th>
                          <th>Hành động</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentShops.map(shop => (
                          <tr key={shop._id} className="um-table-row">
                            <td>
                              <div className="um-user-info">
                                <div className="um-user-avatar-container">
                                  <img
                                    src={shop.user_imageurl || '/default-avatar.png'}
                                    alt={shop.username}
                                    className="um-user-avatar"
                                    onError={(e) => {
                                      e.target.src = '/default-avatar.png';
                                    }}
                                  />
                                  <div className={`um-status-dot ${shop.isActive ? 'active' : 'inactive'}`}></div>
                                </div>
                                <div className="um-user-details">
                                  <span className="um-username">{shop.username}</span>
                                  <small className="um-user-id">ID: {shop._id.slice(-8)}</small>
                                  {shop.fullname && (
                                    <small className="um-fullname">{shop.fullname}</small>
                                  )}
                                </div>
                              </div>
                            </td>
                            
                            <td>
                              <div className="um-contact-info">
                                <div className="um-email">
                                  <i className="fas fa-envelope"></i>
                                  {shop.email}
                                </div>
                                {shop.phone_number && (
                                  <div className="um-phone">
                                    <i className="fas fa-phone"></i>
                                    {shop.phone_number}
                                  </div>
                                )}
                              </div>
                            </td>
                            
                            <td>
                              <div className="um-balance-info">
                                <span className="um-balance">{shop.productCount || 0}</span>
                                <small className="um-account-type">
                                  <i className="fas fa-box"></i>
                                  sản phẩm
                                </small>
                              </div>
                            </td>
                            
                            <td>
                              <div className="um-balance-info">
                                <span className={`um-balance ${shop.reportedCount > 0 ? 'text-danger' : ''}`}>
                                  {shop.reportedCount || 0}
                                </span>
                                <small className="um-account-type">
                                  <i className="fas fa-flag"></i>
                                  báo cáo
                                </small>
                              </div>
                            </td>
                            
                            <td>
                              <div className="um-date-info">
                                <span className="um-date">
                                  {formatDate(shop.created_at)}
                                </span>
                              </div>
                            </td>
                            
                            <td>
                              <button
                                onClick={() => toggleShopStatus(shop)}
                                className={`um-status-btn ${shop.isActive ? 'um-status-active' : 'um-status-inactive'}`}
                              >
                                {shop.isActive ? (
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
                                  onClick={() => {
                                    setSelectedShop(shop);
                                    setShowShopDetailModal(true);
                                  }}
                                  className="um-btn-action um-btn-view"
                                  title="Xem chi tiết"
                                >
                                  <i className="fas fa-eye"></i>
                                </button>
                                
                                <button
                                  onClick={() => {
                                    setSelectedShop(shop);
                                    fetchShopProducts(shop._id);
                                    setShowProductsModal(true);
                                  }}
                                  className="um-btn-action um-btn-edit"
                                  title="Xem sản phẩm"
                                >
                                  <i className="fas fa-box"></i>
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
                        Hiển thị {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredShops.length)} của {filteredShops.length} shop
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
          </>
        ) : (
          // Reports Management Tab
          <div className="um-table-section">
            <div className="um-table-header">
              <h3>
                <i className="fas fa-flag"></i>
                Báo cáo sản phẩm ({reports.length})
              </h3>
            </div>

            {reports.length === 0 ? (
              <div className="um-empty-state">
                <i className="fas fa-flag um-empty-icon"></i>
                <h3>Không có báo cáo nào</h3>
                <p>Chưa có báo cáo sản phẩm nào cần xử lý</p>
              </div>
            ) : (
              <div className="um-table-container">
                <table className="um-users-table">
                  <thead>
                    <tr>
                      <th>Sản phẩm</th>
                      <th>Người báo cáo</th>
                      <th>Shop</th>
                      <th>Lý do</th>
                      <th>Ngày báo cáo</th>
                      <th>Trạng thái</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map(report => (
                      <tr key={report._id} className="um-table-row">
                        <td>
                          <div className="um-user-info">
                            <div className="um-user-avatar-container">
                              <img
                                src={report.product_id?.product_imageurl?.[0] || '/default-product.png'}
                                alt={report.product_id?.product_name}
                                className="um-user-avatar"
                                onError={(e) => {
                                  e.target.src = '/default-product.png';
                                }}
                              />
                            </div>
                            <div className="um-user-details">
                              <span className="um-username">
                                {report.product_id?.product_name || 'Sản phẩm đã xóa'}
                              </span>
                              <small className="um-user-id">
                                ID: {report.product_id?._id?.slice(-8) || 'N/A'}
                              </small>
                            </div>
                          </div>
                        </td>
                        
                        <td>
                          <div className="um-contact-info">
                            <div className="um-email">
                              <i className="fas fa-user"></i>
                              {report.reporter_id?.username || 'N/A'}
                            </div>
                            <div className="um-phone">
                              <i className="fas fa-envelope"></i>
                              {report.reporter_id?.email || 'N/A'}
                            </div>
                          </div>
                        </td>
                        
                        <td>
                          <div className="um-contact-info">
                            <div className="um-email">
                              <i className="fas fa-store"></i>
                              {report.shop_id?.username || 'N/A'}
                            </div>
                            <div className="um-phone">
                              <i className="fas fa-envelope"></i>
                              {report.shop_id?.email || 'N/A'}
                            </div>
                          </div>
                        </td>
                        
                        <td>
                          <div className="um-balance-info">
                            <span className="um-balance">{report.reason}</span>
                            {report.description && (
                              <small className="um-account-type">
                                {report.description.length > 30 
                                  ? `${report.description.substring(0, 30)}...` 
                                  : report.description
                                }
                              </small>
                            )}
                          </div>
                        </td>
                        
                        <td>
                          <div className="um-date-info">
                            <span className="um-date">
                              {formatDate(report.createdAt)}
                            </span>
                          </div>
                        </td>
                        
                        <td>
                          <span className={`um-role-badge ${getReportStatusBadgeColor(report.status)}`}>
                            {report.status === 'pending' ? 'Chờ xử lý' :
                             report.status === 'approved' ? 'Đã chấp nhận' :
                             report.status === 'rejected' ? 'Đã từ chối' : 'N/A'}
                          </span>
                        </td>
                        
                        <td>
                          <div className="um-action-buttons">
                            <button
                              onClick={() => {
                                setSelectedReport(report);
                                setAdminNote('');
                                setShowReportModal(true);
                              }}
                              className="um-btn-action um-btn-view"
                              title="Xem chi tiết"
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            
                            {report.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleReportAction(report._id, 'approve', '')}
                                  className="um-btn-action um-btn-edit"
                                  title="Chấp nhận báo cáo"
                                >
                                  <i className="fas fa-check"></i>
                                </button>
                                
                                <button
                                  onClick={() => handleReportAction(report._id, 'reject', '')}
                                  className="um-btn-action um-btn-delete"
                                  title="Từ chối báo cáo"
                                >
                                  <i className="fas fa-times"></i>
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Shop Detail Modal */}
        {showShopDetailModal && selectedShop && (
          <div className="um-modal-overlay" onClick={() => setShowShopDetailModal(false)}>
            <div className="um-modal-content um-modal-large" onClick={(e) => e.stopPropagation()}>
              <div className="um-modal-header">
                <h3>
                  <i className="fas fa-store"></i>
                  Chi tiết Shop
                </h3>
                <button 
                  onClick={() => setShowShopDetailModal(false)}
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
                        src={selectedShop.user_imageurl || '/default-avatar.png'}
                        alt={selectedShop.username}
                        onError={(e) => {
                          e.target.src = '/default-avatar.png';
                        }}
                      />
                    </div>
                    <div className="um-user-basic-info">
                      <h4>{selectedShop.username}</h4>
                      <p className="um-user-email">{selectedShop.email}</p>
                      <span className={`um-role-badge ${selectedShop.isActive ? 'um-badge-customer' : 'um-badge-admin'}`}>
                        {selectedShop.isActive ? 'Đang hoạt động' : 'Đã khóa'}
                      </span>
                    </div>
                  </div>

                  <div className="um-detail-section">
                    <h4 className="um-section-title">
                      <i className="fas fa-info-circle"></i>
                      Thông tin cơ bản
                    </h4>
                    <div className="um-detail-grid">
                      <div className="um-detail-item">
                        <label>ID Shop:</label>
                        <span className="um-user-id-copy">{selectedShop._id}</span>
                      </div>
                      <div className="um-detail-item">
                        <label>Tên đầy đủ:</label>
                        <span>{selectedShop.fullname || 'N/A'}</span>
                      </div>
                      <div className="um-detail-item">
                        <label>Số điện thoại:</label>
                        <span>{selectedShop.phone_number || 'N/A'}</span>
                      </div>
                      <div className="um-detail-item">
                        <label>Địa chỉ:</label>
                        <span>{selectedShop.address || 'N/A'}</span>
                      </div>
                      <div className="um-detail-item">
                        <label>Ngày đăng ký:</label>
                        <span>{formatDate(selectedShop.created_at)}</span>
                      </div>
                      <div className="um-detail-item">
                        <label>Trạng thái:</label>
                        <span className={`um-status-indicator ${selectedShop.isActive ? 'active' : 'inactive'}`}>
                          <i className={`fas ${selectedShop.isActive ? 'fa-check-circle' : 'fa-ban'}`}></i>
                          {selectedShop.isActive ? 'Đang hoạt động' : 'Đã khóa'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="um-detail-section">
                    <h4 className="um-section-title">
                      <i className="fas fa-chart-bar"></i>
                      Thống kê Shop
                    </h4>
                    <div className="um-detail-grid">
                      <div className="um-detail-item">
                        <label>Tổng sản phẩm:</label>
                        <span>{selectedShop.productCount || 0}</span>
                      </div>
                      <div className="um-detail-item">
                        <label>Sản phẩm bị báo cáo:</label>
                        <span className={selectedShop.reportedCount > 0 ? 'text-danger' : ''}>
                          {selectedShop.reportedCount || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  {selectedShop.wallet && (
                    <div className="um-wallet-info">
                      <div className="um-wallet-balance">
                        <span className="um-balance-label">Số dư ví</span>
                        <span className="um-balance-amount">
                          {formatCurrency(selectedShop.wallet.balance || 0)}
                        </span>
                      </div>
                      <div className="um-wallet-currency">
                        <span className="um-currency-label">Tiền tệ:</span>
                        <span>{selectedShop.wallet.currency || 'VND'}</span>
                      </div>
                      <div className="um-wallet-updated">
                        <span className="um-updated-label">Cập nhật lần cuối:</span>
                        <span>{formatDate(selectedShop.wallet.last_updated)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="um-modal-footer">
                <div className="um-quick-actions">
                  <button
                    onClick={() => {
                      setShowShopDetailModal(false);
                      fetchShopProducts(selectedShop._id);
                      setShowProductsModal(true);
                    }}
                    className="um-btn um-btn-primary"
                  >
                    <i className="fas fa-box"></i>
                    Xem sản phẩm
                  </button>
                  <button
                    onClick={() => toggleShopStatus(selectedShop)}
                    className={`um-btn ${selectedShop.isActive ? 'um-btn-warning' : 'um-btn-success'}`}
                  >
                    <i className={`fas ${selectedShop.isActive ? 'fa-ban' : 'fa-check'}`}></i>
                    {selectedShop.isActive ? 'Khóa Shop' : 'Mở khóa Shop'}
                  </button>
                  <button
                    onClick={() => setShowShopDetailModal(false)}
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

        {/* Shop Products Modal */}
        {showProductsModal && selectedShop && (
          <div className="um-modal-overlay" onClick={() => setShowProductsModal(false)}>
            <div className="um-modal-content um-modal-large" onClick={(e) => e.stopPropagation()}>
              <div className="um-modal-header">
                <h3>
                  <i className="fas fa-box"></i>
                  Sản phẩm của {selectedShop.username}
                </h3>
                <button 
                  onClick={() => setShowProductsModal(false)}
                  className="um-close-btn"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              
              <div className="um-modal-body">
                {shopProducts.length === 0 ? (
                  <div className="um-empty-state">
                    <i className="fas fa-box-open um-empty-icon"></i>
                    <h3>Không có sản phẩm</h3>
                    <p>Shop này chưa có sản phẩm nào</p>
                  </div>
                ) : (
                  <div className="um-table-container">
                    <table className="um-users-table">
                      <thead>
                        <tr>
                          <th>Sản phẩm</th>
                          <th>Giá</th>
                          <th>Số lượng</th>
                          <th>Trạng thái</th>
                          <th>Ngày tạo</th>
                          <th>Hành động</th>
                        </tr>
                      </thead>
                      <tbody>
                        {shopProducts.map(product => (
                          <tr key={product._id} className="um-table-row">
                            <td>
                              <div className="um-user-info">
                                <div className="um-user-avatar-container">
                                  <img
                                    src={product.product_imageurl?.[0] || '/default-product.png'}
                                    alt={product.product_name}
                                    className="um-user-avatar"
                                    onError={(e) => {
                                      e.target.src = '/default-product.png';
                                    }}
                                  />
                                </div>
                                <div className="um-user-details">
                                  <span className="um-username">{product.product_name}</span>
                                  <small className="um-user-id">ID: {product._id.slice(-8)}</small>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className="um-balance">
                                {formatCurrency(product.product_price)}
                              </span>
                            </td>
                            <td>
                              <span className={product.product_quantity === 0 ? 'text-danger' : ''}>
                                {product.product_quantity}
                                {product.product_quantity === 0 && ' (Hết hàng)'}
                              </span>
                            </td>
                            <td>
                              <span className={`um-role-badge ${getStatusBadgeColor(product.product_status)}`}>
                                {product.product_status === 'available' ? 'Đang bán' :
                                 product.product_status === 'reported' ? 'Bị báo cáo' :
                                 product.product_status === 'not_available' ? 'Ngừng bán' : 'N/A'}
                              </span>
                            </td>
                            <td>
                              <span>{formatDate(product.createdAt)}</span>
                            </td>
                            <td>
                              <div className="um-action-buttons">
                                <button
                                  onClick={() => handleDeleteProduct(product._id)}
                                  className="um-btn-action um-btn-delete"
                                  title="Xóa sản phẩm"
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
              </div>
              
              <div className="um-modal-footer">
                <button
                  onClick={() => setShowProductsModal(false)}
                  className="um-btn um-btn-secondary"
                >
                  <i className="fas fa-times"></i>
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Report Detail Modal */}
        {showReportModal && selectedReport && (
          <div className="um-modal-overlay" onClick={() => setShowReportModal(false)}>
            <div className="um-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="um-modal-header">
                <h3>
                  <i className="fas fa-flag"></i>
                  Chi tiết báo cáo
                </h3>
                <button 
                  onClick={() => setShowReportModal(false)}
                  className="um-close-btn"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              
              <div className="um-modal-body">
                <div className="um-detail-section">
                  <h4 className="um-section-title">
                    <i className="fas fa-info-circle"></i>
                    Thông tin báo cáo
                  </h4>
                  <div className="um-detail-grid">
                    <div className="um-detail-item">
                      <label>Sản phẩm:</label>
                      <span>{selectedReport.product_id?.product_name || 'Sản phẩm đã xóa'}</span>
                    </div>
                    <div className="um-detail-item">
                      <label>Người báo cáo:</label>
                      <span>{selectedReport.reporter_id?.username || 'N/A'}</span>
                    </div>
                    <div className="um-detail-item">
                      <label>Shop:</label>
                      <span>{selectedReport.shop_id?.username || 'N/A'}</span>
                    </div>
                    <div className="um-detail-item">
                      <label>Lý do:</label>
                      <span>{selectedReport.reason}</span>
                    </div>
                    <div className="um-detail-item">
                      <label>Mô tả:</label>
                      <span>{selectedReport.description || 'Không có'}</span>
                    </div>
                    <div className="um-detail-item">
                      <label>Ngày báo cáo:</label>
                      <span>{formatDate(selectedReport.createdAt)}</span>
                    </div>
                    <div className="um-detail-item">
                      <label>Trạng thái:</label>
                      <span className={`um-role-badge ${getReportStatusBadgeColor(selectedReport.status)}`}>
                        {selectedReport.status === 'pending' ? 'Chờ xử lý' :
                         selectedReport.status === 'approved' ? 'Đã chấp nhận' :
                         selectedReport.status === 'rejected' ? 'Đã từ chối' : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {selectedReport.status === 'pending' && (
                  <div className="um-detail-section">
                    <h4 className="um-section-title">
                      <i className="fas fa-edit"></i>
                      Ghi chú của Admin
                    </h4>
                    <textarea
                      value={adminNote}
                      onChange={(e) => setAdminNote(e.target.value)}
                      placeholder="Nhập ghi chú của admin (tùy chọn)..."
                      className="um-form-input"
                      rows="3"
                      style={{ width: '100%', resize: 'vertical' }}
                    />
                  </div>
                )}

                {selectedReport.admin_note && (
                  <div className="um-detail-section">
                    <h4 className="um-section-title">
                      <i className="fas fa-user-shield"></i>
                      Ghi chú của Admin
                    </h4>
                    <p>{selectedReport.admin_note}</p>
                  </div>
                )}
              </div>
              
              <div className="um-modal-footer">
                {selectedReport.status === 'pending' ? (
                  <>
                    <button
                      onClick={() => handleReportAction(selectedReport._id, 'approve', adminNote)}
                      className="um-btn um-btn-success"
                    >
                      <i className="fas fa-check"></i>
                      Chấp nhận báo cáo
                    </button>
                    <button
                      onClick={() => handleReportAction(selectedReport._id, 'reject', adminNote)}
                      className="um-btn um-btn-danger"
                    >
                      <i className="fas fa-times"></i>
                      Từ chối báo cáo
                    </button>
                  </>
                ) : (
                  <div className="um-warning-message">
                    <i className="fas fa-info-circle um-warning-icon"></i>
                    <p>Báo cáo này đã được xử lý</p>
                  </div>
                )}
                <button
                  onClick={() => setShowReportModal(false)}
                  className="um-btn um-btn-secondary"
                >
                  <i className="fas fa-times"></i>
                  Đóng
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

export default AdminShopManagement;