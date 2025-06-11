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
      // Implementation similar to other components
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

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentShops = filteredShops.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredShops.length / itemsPerPage);

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
        <div className="um-tab-navigation">
          <button
            className={`um-tab-btn ${activeTab === 'shops' ? 'active' : ''}`}
            onClick={() => setActiveTab('shops')}
          >
            <i className="fas fa-store"></i>
            Quản lý Shop ({filteredShops.length})
          </button>
          <button
            className={`um-tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            <i className="fas fa-flag"></i>
            Báo cáo sản phẩm ({reports.filter(r => r.status === 'pending').length})
          </button>
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
                  onClick={() => {
                    setSearchTerm('');
                    setFilterStatus('all');
                  }}
                  className="um-btn um-btn-secondary um-reset-btn"
                >
                  <i className="fas fa-undo"></i>
                  Đặt lại
                </button>
              </div>
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
                      <th>Người báo cáo</th