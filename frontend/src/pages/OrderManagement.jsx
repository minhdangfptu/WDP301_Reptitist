// OrderManagement.jsx - Updated Implementation with 2 Action Buttons Only
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useNavigate, Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import axios from 'axios';
import '../css/OrderManagement.css'; // Import CSS riêng

import { baseUrl } from '../config';

const OrderManagement = () => {
  const { user, canSellProduct } = useAuth();
  const navigate = useNavigate();

  // State management
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  // Stats từ dashboard API
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    totalRevenue: 0
  });

  // Filter states
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal states
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Permission check
  useEffect(() => {
    if (!canSellProduct()) {
      toast.error('Bạn không có quyền truy cập trang này');
      navigate('/');
      return;
    }
    initializeData();
  }, [canSellProduct, navigate]);

  // Initialize data (fetch both orders and stats)
  const initializeData = async () => {
    try {
      setLoading(true);
      setStatsLoading(true);
      
      await Promise.all([
        fetchOrders(),
        fetchStats()
      ]);
    } catch (error) {
      console.error('Error initializing data:', error);
      toast.error('Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
      setStatsLoading(false);
    }
  };

  // Fetch orders using correct API endpoint
  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      console.log('🔥 Fetching shop orders...');

      const response = await axios.get(`${baseUrl}/reptitist/order/shop-orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('✅ Orders Response:', response.data);

      const ordersData = response.data?.data || response.data?.orders || response.data || [];
      setOrders(ordersData);
      setFilteredOrders(ordersData);

    } catch (error) {
      console.error('❌ Error fetching orders:', error);
      toast.error('Không thể tải danh sách đơn hàng');
      setOrders([]);
      setFilteredOrders([]);
    }
  };

  // Fetch stats from dashboard API
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      console.log('🔥 Fetching dashboard stats for orders...');

      const response = await axios.get(
        `${baseUrl}/reptitist/shop/dashboard-stats`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { timeFilter: 'day' }
        }
      );


      // Process response same way as other pages
      let dashboardData = null;
      
      if (response.data?.success && response.data?.data) {
        dashboardData = response.data.data;
      } else if (response.data?.data) {
        dashboardData = response.data.data;
      } else if (response.data && typeof response.data === 'object') {
        dashboardData = response.data;
      }

      if (dashboardData && dashboardData.basicStats) {
        const basicStats = dashboardData.basicStats;
        
        setStats({
          totalOrders: basicStats.totalOrders || 0,
          pendingOrders: basicStats.pendingOrders || 0,
          shippedOrders: basicStats.shippedOrders || 0,
          deliveredOrders: basicStats.deliveredOrders || 0,
          completedOrders: basicStats.completedOrders || 0,
          cancelledOrders: basicStats.cancelledOrders || 0,
          totalRevenue: basicStats.totalRevenue || 0
        });
      } else {
        // Set defaults if no stats available
        setStats({
          totalOrders: orders.length || 0,
          pendingOrders: orders.filter(o => o.order_status === 'ordered').length || 0,
          shippedOrders: orders.filter(o => o.order_status === 'shipped').length || 0,
          deliveredOrders: orders.filter(o => o.order_status === 'delivered').length || 0,
          cancelledOrders: orders.filter(o => o.order_status === 'cancelled').length || 0,
          totalRevenue: 0
        });
      }

    } catch (error) {
      console.error('❌ Error fetching stats:', error);
      
      // Calculate stats from orders data as fallback
      setStats({
        totalOrders: orders.length || 0,
        pendingOrders: orders.filter(o => o.order_status === 'ordered').length || 0,
        shippedOrders: orders.filter(o => o.order_status === 'shipped').length || 0,
        deliveredOrders: orders.filter(o => o.order_status === 'delivered').length || 0,
        cancelledOrders: orders.filter(o => o.order_status === 'cancelled').length || 0,
        totalRevenue: 0
      });
    }
  };

  // Update order status using correct API endpoint
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      console.log('🔄 Updating order status:', orderId, newStatus);

      if (newStatus === 'shipped') {
        // Use the specific ship order endpoint
        await axios.put(`${baseUrl}/reptitist/order/mark-shipped-order`, null, {
          headers: { Authorization: `Bearer ${token}` },
          params: { id: orderId }
        });
      } else if (newStatus === 'delivered') {
        // Use shop endpoint to mark as delivered
        await axios.get(`${baseUrl}/reptitist/order/update-order-status-by-shop`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { id: orderId, status: 'delivered' }
        });
      } else if (newStatus === 'cancelled') {
        // Use shop endpoint to mark as cancelled
        await axios.get(`${baseUrl}/reptitist/order/update-order-status-by-shop`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { id: orderId, status: 'cancelled' }
        });
      }

      // Success messages based on status
      const statusMessages = {
        'shipped': 'Đã đánh dấu đơn hàng đang vận chuyển',
        'delivered': 'Đã đánh dấu đơn hàng đã giao thành công',
        'cancelled': 'Đã đánh dấu đơn hàng giao thất bại'
      };

      toast.success(statusMessages[newStatus] || 'Cập nhật trạng thái đơn hàng thành công');
      
      // Refresh data
      await Promise.all([fetchOrders(), fetchStats()]);
      
    } catch (error) {
      console.error('❌ Error updating order status:', error);
      console.error('Error details:', error.response?.data || error.message);
      
      // Show more specific error message
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Không thể cập nhật trạng thái đơn hàng');
      }
    }
  };

  // Helper function to get product image URL - FIX IMAGE DISPLAY
  const getProductImageUrl = (product) => {
    
    // Nếu là URL thông thường, return trực tiếp
    if (product?.product_imageurl[0] && (product?.product_imageurl[0].startsWith('http') || product?.product_imageurl[0].startsWith('/'))) {
      return product?.product_imageurl[0];
    }
    
    // Fallback to default image
    return '/images/default-product.png';
  };

  // Filter and search logic
  useEffect(() => {
    let filtered = [...orders];

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(order =>
        order._id.toLowerCase().includes(searchLower) ||
        order.customer_id?.username?.toLowerCase().includes(searchLower) ||
        order.customer_id?.email?.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(order => order.order_status === filterStatus);
    }

    // Sort by creation date (newest first)
    filtered.sort((a, b) => new Date(b.order_date || b.createdAt) - new Date(a.order_date || a.createdAt));

    setFilteredOrders(filtered);
    setCurrentPage(1);
  }, [orders, searchTerm, filterStatus]);

  // Format functions
  const formatCurrency = (amount) => {
    if (amount == null || isNaN(amount)) return '0₫';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatNumber = (num) => {
    if (num == null || isNaN(num)) return '0';
    return new Intl.NumberFormat('vi-VN').format(num);
  };

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

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'ordered': return 'om-badge-admin'; // Orange/yellow for pending
      case 'shipped': return 'om-badge-shop'; // Blue for shipped  
      case 'delivered': return 'om-badge-delivered'; // Green for delivered
      case 'cancelled': return 'om-badge-default';
      case 'completed': return 'om-badge-customer'; // Purple for completed
      default: return 'om-badge-default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'ordered': return 'Chờ xử lý';
      case 'shipped': return 'Đang vận chuyển';
      case 'delivered': return 'Đã giao hàng';
      case 'cancelled': return 'Giao thất bại';
      case 'completed': return 'Đã hoàn thành';
      default: return 'Không xác định';
    }
  };

  // Check if button should be enabled based on current order status
  const canPerformAction = (currentStatus, targetStatus) => {
    switch (targetStatus) {
      case 'shipped':
        return currentStatus === 'ordered';
      case 'delivered':
        return currentStatus === 'shipped';
      case 'cancelled':
        return currentStatus === 'shipped';
      default:
        return false;
    }
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
    setCurrentPage(1);
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  // Loading state
  if (loading) {
    return (
      <>
        <Header />
        <div className="om-user-list-container">
          <div className="om-loading-state">
            <div className="om-spinner"></div>
            <h3>Đang tải dữ liệu đơn hàng...</h3>
            <p>Vui lòng đợi trong giây lát</p>
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

      <div className="om-user-list-container">
        {/* Page Header */}
        <div className="om-page-header">
          <div className="om-page-header-content">
            <div className="om-page-header-text">
              <h1>
                <i className="fas fa-clipboard-list"></i>
                Quản lý đơn hàng
              </h1>
              <p>Quản lý và xử lý tất cả đơn hàng từ khách hàng</p>
              <div className="om-header-breadcrumb">
                <Link to="/">Trang chủ</Link>
                <i className="fas fa-chevron-right"></i>
                <Link to="/ShopDashboard">Dashboard</Link>
                <i className="fas fa-chevron-right"></i>
                <span>Quản lý đơn hàng</span>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Dashboard */}
        <div className="om-stats-dashboard">
          <div className="om-stats-grid">
            <div className="om-stat-card om-stat-total">
              <div className="om-stat-icon">
                <i className="fas fa-shopping-cart"></i>
              </div>
              <div className="om-stat-content">
                <span className="om-stat-number">{formatNumber(stats.totalOrders)}</span>
                <span className="om-stat-label">Tổng đơn hàng</span>
              </div>
            </div>

            <div className="om-stat-card om-stat-shop">
              <div className="om-stat-icon">
                <i className="fas fa-check-circle"></i>
              </div>
              <div className="om-stat-content">
                <span className="om-stat-number">{formatNumber(stats.completedOrders)}</span>
                <span className="om-stat-label">Đã hoàn thành</span>
              </div>
            </div>

            <div className="om-stat-card om-stat-admin">
              <div className="om-stat-icon">
                <i className="fas fa-clock"></i>
              </div>
              <div className="om-stat-content">
                <span className="om-stat-number">{formatNumber(stats.pendingOrders)}</span>
                <span className="om-stat-label">Chờ xử lý</span>
              </div>
            </div>

            <div className="om-stat-card om-stat-shop">
              <div className="om-stat-icon">
                <i className="fas fa-shipping-fast"></i>
              </div>
              <div className="om-stat-content">
                <span className="om-stat-number">{formatNumber(stats.shippedOrders)}</span>
                <span className="om-stat-label">Đang vận chuyển</span>
              </div>
            </div>

            <div className="om-stat-card om-stat-customer">
              <div className="om-stat-icon">
                <i className="fas fa-map-marker-alt"></i>
              </div>
              <div className="om-stat-content">
                <span className="om-stat-number">{formatNumber(stats.deliveredOrders)}</span>
                <span className="om-stat-label">Đã giao hàng</span>
              </div>
            </div>

            <div className="om-stat-card om-stat-inactive">
              <div className="om-stat-icon">
                <i className="fas fa-times-circle"></i>
              </div>
              <div className="om-stat-content">
                <span className="om-stat-number">{formatNumber(stats.cancelledOrders)}</span>
                <span className="om-stat-label">Giao thất bại</span>
              </div>
            </div>

            <div className="om-stat-card om-stat-active">
              <div className="om-stat-icon">
                <i className="fas fa-chart-line"></i>
              </div>
              <div className="om-stat-content">
                <span className="om-stat-number">{formatCurrency(stats.totalRevenue)}</span>
                <span className="om-stat-label">Tổng doanh thu</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="om-filters-section">
          <div className="om-filters-row">
            <div className="om-search-box">
              <input
                type="text"
                placeholder="Tìm kiếm đơn hàng theo ID, tên khách hàng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="om-search-input"
              />
              <i className="fas fa-search om-search-icon"></i>
            </div>

            <div className="om-filter-group">
              <label>Trạng thái:</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="om-filter-select"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="ordered">Chờ xử lý</option>
                <option value="shipped">Đang vận chuyển</option>
                <option value="delivered">Đã giao hàng</option>
                <option value="cancelled">Giao thất bại</option>
              </select>
            </div>

            <div className="om-filter-group">
              <label>Hiển thị:</label>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="om-filter-select"
              >
                <option value={10}>10 mục</option>
                <option value={25}>25 mục</option>
                <option value={50}>50 mục</option>
              </select>
            </div>

            <button
              onClick={resetFilters}
              className="om-btn om-btn-secondary om-reset-btn"
            >
              <i className="fas fa-undo"></i>
              Đặt lại
            </button>
          </div>

          {/* Filter Summary */}
          {(searchTerm || filterStatus !== 'all') && (
            <div className="om-filter-summary">
              <div className="om-filter-results">
                <span>Hiển thị {filteredOrders.length} / {orders.length} đơn hàng</span>
              </div>
              <div className="om-filter-tags">
                {searchTerm && (
                  <span className="om-filter-tag">
                    <i className="fas fa-search"></i>"{searchTerm}"
                    <button onClick={() => setSearchTerm('')}>×</button>
                  </span>
                )}
                {filterStatus !== 'all' && (
                  <span className="om-filter-tag">
                    <i className="fas fa-filter"></i>
                    {getStatusText(filterStatus)}
                    <button onClick={() => setFilterStatus('all')}>×</button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Orders Table Section */}
        <div className="om-table-section">
          {currentOrders.length === 0 ? (
            <div className="om-empty-state">
              <i className="fas fa-clipboard-list om-empty-icon"></i>
              <h3>Không có đơn hàng nào</h3>
              <p>
                {searchTerm || filterStatus !== 'all'
                  ? 'Không tìm thấy đơn hàng phù hợp với bộ lọc hiện tại'
                  : 'Bạn chưa có đơn hàng nào. Đơn hàng mới sẽ xuất hiện ở đây khi có khách hàng đặt hàng.'
                }
              </p>
            </div>
          ) : (
            <>
              <div className="om-table-header">
                <h3>
                  <i className="fas fa-table"></i>
                  Danh sách đơn hàng ({filteredOrders.length})
                </h3>
                <div className="om-table-actions">
                  <button
                    onClick={() => initializeData()}
                    className="om-btn om-btn-secondary om-btn-icon"
                    title="Làm mới"
                  >
                    <i className="fas fa-sync-alt"></i>
                  </button>
                </div>
              </div>

              <div className="om-table-container">
                <table className="om-users-table">
                  <thead>
                    <tr>
                      <th>Mã đơn hàng</th>
                      <th>Khách hàng</th>
                      <th>Sản phẩm</th>
                      <th>Tổng tiền</th>
                      <th>Ngày đặt</th>
                      <th>Trạng thái</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentOrders.map((order) => (
                      <tr key={order._id} className="om-table-row">
                        <td>
                          <div className="om-user-info">
                            <div className="om-user-details">
                              <span className="om-username">
                                #{order._id.slice(-8)}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <div className="om-contact-info">
                            <div className="om-email">
                              <i className="fas fa-user"></i>
                              {order.customer_id?.username || 'Khách hàng'}
                            </div>
                            <div className="om-phone">
                              <i className="fas fa-envelope"></i>
                              {order.customer_id?.email || 'N/A'}
                            </div>
                          </div>
                        </td>

                        <td>
                          <div className="om-balance-info">
                            <span className="om-balance">
                              {order.order_items?.length || 0} sản phẩm
                            </span>
                            <small className="om-account-type">
                              <i className="fas fa-box"></i>
                              {order.order_items?.[0]?.product_id?.product_name?.substring(0, 20) || 'Sản phẩm'}
                              {order.order_items?.length > 1 && '...'}
                            </small>
                          </div>
                        </td>

                        <td>
                          <span className="om-balance">
                            {formatCurrency(order.order_price)}
                          </span>
                        </td>

                        <td>
                          <div className="om-date-info">
                            <span className="om-date">
                              {formatDate(order.order_date || order.createdAt)}
                            </span>
                          </div>
                        </td>

                        <td>
                          <span className={`om-role-badge ${getStatusBadgeClass(order.order_status)}`}>
                            {getStatusText(order.order_status)}
                          </span>
                        </td>

                        <td>
                          <div className="om-action-buttons">
                            {/* Chỉ hiển thị 2 nút: Đang vận chuyển và Xem chi tiết */}
                            <button
                              onClick={() => updateOrderStatus(order._id, 'shipped')}
                              disabled={!canPerformAction(order.order_status, 'shipped')}
                              className={`om-btn-action ${canPerformAction(order.order_status, 'shipped') ? 'om-btn-edit' : 'om-btn-disabled'}`}
                              title={canPerformAction(order.order_status, 'shipped') ? 'Đánh dấu đang vận chuyển' : 'Chỉ có thể vận chuyển khi đang chờ xử lý'}
                            >
                              <i className="fas fa-shipping-fast"></i>
                            </button>
                            
                            <button
                              onClick={() => {
                                setSelectedOrder(order);
                                setShowDetailModal(true);
                              }}
                              className="om-btn-action om-btn-view"
                              title="Xem chi tiết"
                            >
                              <i className="fas fa-eye"></i>
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
                <div className="om-pagination">
                  <div className="om-pagination-info">
                    Hiển thị {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredOrders.length)} của {filteredOrders.length} đơn hàng
                  </div>

                  <div className="om-pagination-controls">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="om-pagination-btn om-pagination-prev"
                    >
                      <i className="fas fa-chevron-left"></i>
                      Trước
                    </button>

                    <div className="om-pagination-numbers">
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        let pageNumber;
                        if (totalPages <= 5) {
                          pageNumber = i + 1;
                        } else if (currentPage <= 3) {
                          pageNumber = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNumber = totalPages - 4 + i;
                        } else {
                          pageNumber = currentPage - 2 + i;
                        }

                        return (
                          <button
                            key={pageNumber}
                            onClick={() => setCurrentPage(pageNumber)}
                            className={`om-pagination-btn ${currentPage === pageNumber ? 'active' : ''}`}
                          >
                            {pageNumber}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="om-pagination-btn om-pagination-next"
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

        {/* Order Detail Modal */}
        {showDetailModal && selectedOrder && (
          <div className="om-modal-overlay" onClick={() => setShowDetailModal(false)}>
            <div className="om-modal-content om-modal-large" onClick={(e) => e.stopPropagation()}>
              <div className="om-modal-header">
                <h3>
                  <i className="fas fa-clipboard-list"></i>
                  Chi tiết đơn hàng #{selectedOrder._id.slice(-8)}
                </h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="om-close-btn"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <div className="om-modal-body">
                <div className="om-user-detail-container">
                  <div className="om-detail-header">
                    <div className="om-user-basic-info">
                      <h4>Đơn hàng #{selectedOrder._id.slice(-8)}</h4>
                      <p className="om-user-email">Đặt hàng: {formatDate(selectedOrder.order_date || selectedOrder.createdAt)}</p>
                      <span className={`om-role-badge ${getStatusBadgeClass(selectedOrder.order_status)}`}>
                        {getStatusText(selectedOrder.order_status)}
                      </span>
                    </div>
                  </div>

                  <div className="om-detail-section">
                    <h4 className="om-section-title">
                      <i className="fas fa-user"></i>
                      Thông tin khách hàng
                    </h4>
                    <div className="om-detail-grid">
                      <div className="om-detail-item">
                        <label>Tên khách hàng:</label>
                        <span>{selectedOrder.customer_id?.username || 'N/A'}</span>
                      </div>
                      <div className="om-detail-item">
                        <label>Email:</label>
                        <span>{selectedOrder.customer_id?.email || 'N/A'}</span>
                      </div>
                      <div className="om-detail-item">
                        <label>Ngày đặt hàng:</label>
                        <span>{formatDate(selectedOrder.order_date || selectedOrder.createdAt)}</span>
                      </div>
                      <div className="om-detail-item">
                        <label>Trạng thái:</label>
                        <span className={`om-role-badge ${getStatusBadgeClass(selectedOrder.order_status)}`}>
                          {getStatusText(selectedOrder.order_status)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="om-detail-section">
                    <h4 className="om-section-title">
                      <i className="fas fa-box"></i>
                      Sản phẩm đặt hàng
                    </h4>
                    <div className="om-order-items">
                      {selectedOrder.order_items?.map((item, index) => (
                        <div key={index} className="om-order-item">
                          <div className="om-item-info">
                            <img 
                              src={getProductImageUrl(item.product_id)}  //item.product_id?.product_imageurl?.[0]
                              alt={item.product_id?.product_name || 'Sản phẩm'}
                              className="om-item-image"
                              onError={(e) => {
                                e.target.src = '/images/default-product.png';
                              }}
                            />
                            <div className="om-item-details">
                              <h5>{item.product_id?.product_name || 'Sản phẩm đã xóa'}</h5>
                              <p>Số lượng: {item.quantity}</p>
                              <p>Giá: {formatCurrency(item.product_id?.product_price || 0)}</p>
                              <p>Thành tiền: {formatCurrency((item.product_id?.product_price || 0) * item.quantity)}</p>
                            </div>
                          </div>
                        </div>
                      )) || (
                        <p>Không có thông tin sản phẩm</p>
                      )}
                    </div>
                  </div>

                  <div className="om-detail-section">
                    <h4 className="om-section-title">
                      <i className="fas fa-calculator"></i>
                      Tổng kết đơn hàng
                    </h4>
                    <div className="om-order-summary">
                      <div className="om-summary-item">
                        <span>Tổng tiền hàng:</span>
                        <span>{formatCurrency(selectedOrder.order_price)}</span>
                      </div>
                      <div className="om-summary-item total">
                        <span>Tổng cộng:</span>
                        <span>{formatCurrency(selectedOrder.order_price)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="om-modal-footer">
                <div className="om-quick-actions">
                  {/* Hiển thị các nút hành động dựa trên trạng thái đơn hàng */}
                  {selectedOrder.order_status === 'ordered' && (
                    <button
                      onClick={() => {
                        updateOrderStatus(selectedOrder._id, 'shipped');
                        setShowDetailModal(false);
                      }}
                      className="om-btn om-btn-primary"
                    >
                      <i className="fas fa-shipping-fast"></i>
                      Đánh dấu đang vận chuyển
                    </button>
                  )}
                  {selectedOrder.order_status === 'shipped' && (
                    <>
                      <button
                        onClick={() => {
                          updateOrderStatus(selectedOrder._id, 'delivered');
                          setShowDetailModal(false);
                        }}
                        className="om-btn om-btn-success"
                      >
                        <i className="fas fa-check-circle"></i>
                        Đánh dấu đã giao hàng
                      </button>
                      <button
                        onClick={() => {
                          updateOrderStatus(selectedOrder._id, 'cancelled');
                          setShowDetailModal(false);
                        }}
                        className="om-btn om-btn-danger"
                      >
                        <i className="fas fa-times-circle"></i>
                        Đánh dấu giao thất bại
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="om-btn om-btn-secondary"
                  >
                    <i className="fas fa-times"></i>
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </>
  );
};

export default OrderManagement;