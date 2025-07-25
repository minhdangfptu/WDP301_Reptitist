import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useNavigate, Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import axios from 'axios';
import '../css/ProductManagement.css';
import { baseUrl } from '../config';

const ShopProductManagement = () => {
  const { user, canSellProduct } = useAuth();
  const navigate = useNavigate();

  // State management
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  
  // ✅ Updated stats state to match dashboard API response
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    draftProducts: 0,
    totalValue: 0,
    // Order-related stats from dashboard
    totalOrders: 0,
    pendingOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    totalRevenue: 0
  });

  const [categories, setCategories] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Modal states
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Form states
  const [editForm, setEditForm] = useState({
    product_name: '',
    product_description: '',
    product_price: '',
    product_quantity: '',
    product_category_id: '',
    product_status: 'available'
  });
  const [editErrors, setEditErrors] = useState({});
  const [editLoading, setEditLoading] = useState(false);

  const searchInputRef = useRef(null);

  // Permission check
  useEffect(() => {
    if (!canSellProduct()) {
      toast.error('Bạn không có quyền truy cập trang này');
      navigate('/');
      return;
    }
    initializeData();
  }, [canSellProduct, navigate]);

  // ✅ Updated data fetching to use dashboard API
  const initializeData = async () => {
    try {
      setLoading(true);
      setStatsLoading(true);
      
      await Promise.all([
        fetchProducts(),
        fetchCategories(),
        fetchStats() // ✅ Fetch stats from dashboard API
      ]);
    } catch (error) {
      console.error('Error initializing data:', error);
      toast.error('Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
      setStatsLoading(false);
    }
  };

  // ✅ Updated fetchStats to use dashboard API
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      console.log('🔥 ProductManagement: Fetching stats from dashboard API...');

      // ✅ Use dashboard-stats API (same as ShopDashboard)
      const response = await axios.get(
        `${baseUrl}/reptitist/shop/dashboard-stats`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { timeFilter: 'day' } // Default to day filter
        }
      );

      // console.log('✅ Dashboard Stats Response:', response.data);

      // ✅ Process response same way as ShopDashboard
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
        
        // console.log('📊 Setting stats from basicStats:', basicStats);
        
        setStats({
          totalProducts: basicStats.totalProducts || 0,
          activeProducts: basicStats.activeProducts || 0,
          draftProducts: basicStats.draftProducts || 0,
          totalValue: basicStats.totalValue || 0,
          totalOrders: basicStats.totalOrders || 0,
          pendingOrders: basicStats.pendingOrders || 0,
          shippedOrders: basicStats.shippedOrders || 0,
          deliveredOrders: basicStats.deliveredOrders || 0,
          cancelledOrders: basicStats.cancelledOrders || 0,
          totalRevenue: basicStats.totalRevenue || 0
        });
      } else {
        console.warn('⚠️ No basicStats found, using fallback my-stats API...');
        
        // ✅ Fallback to my-stats API
        const fallbackResponse = await axios.get(
          `${baseUrl}/reptitist/shop/my-stats`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        const fallbackData = fallbackResponse.data?.data || fallbackResponse.data;
        
        setStats({
          totalProducts: fallbackData.totalProducts || 0,
          activeProducts: fallbackData.activeProducts || 0,
          draftProducts: fallbackData.draftProducts || 0,
          totalValue: fallbackData.totalValue || 0,
          totalOrders: 0, // my-stats doesn't have order data
          pendingOrders: 0,
          shippedOrders: 0,
          deliveredOrders: 0,
          cancelledOrders: 0,
          totalRevenue: 0
        });
      }

    } catch (error) {
      console.error('❌ Error fetching stats:', error);
      
      // Set default values on error
      setStats({
        totalProducts: 0,
        activeProducts: 0,
        draftProducts: 0,
        totalValue: 0,
        totalOrders: 0,
        pendingOrders: 0,
        shippedOrders: 0,
        deliveredOrders: 0,
        cancelledOrders: 0,
        totalRevenue: 0
      });
    }
  };

  // Fetch products
  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const response = await axios.get(`${baseUrl}/reptitist/shop/my-products`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data && Array.isArray(response.data)) {
        setProducts(response.data);
        setFilteredProducts(response.data);
      } else {
        setProducts([]);
        setFilteredProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Không thể tải danh sách sản phẩm');
      setProducts([]);
      setFilteredProducts([]);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${baseUrl}/reptitist/shop/category`);
      if (response.data && Array.isArray(response.data)) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  // ✅ Format functions (same as ShopDashboard)
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

  const formatInventoryValue = (amount) => {
    if (amount == null || isNaN(amount)) return '0₫';
    const abs = Math.abs(amount);
    let value = amount;
    let suffix = '';
    
    if (abs >= 1e12) {
      value = amount / 1e12;
      suffix = 'T'; // Nghìn tỉ
    } else if (abs >= 1e9) {
      value = amount / 1e9;
      suffix = 'B'; // Tỉ
    } else if (abs >= 1e6) {
      value = amount / 1e6;
      suffix = 'M'; // Triệu
    }
    
    const formatted = value % 1 === 0 ? value.toFixed(0) : value.toFixed(2).replace(/\.0+$/, '');
    return `${formatted}${suffix}₫`;
  };

  // Calculate additional stats from products
  const outOfStockProducts = products.filter(p => p.product_quantity === 0).length;
  const reportedProducts = products.filter(p => p.product_status === 'reported').length;

  // Filter and search logic
  useEffect(() => {
    let filtered = [...products];

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(product =>
        product.product_name.toLowerCase().includes(searchLower) ||
        product.product_description?.toLowerCase().includes(searchLower) ||
        product._id.toLowerCase().includes(searchLower)
      );
    }

    // Category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(product => 
        product.product_category_id?._id === filterCategory
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(product => product.product_status === filterStatus);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === 'createdAt' || sortField === 'updatedAt') {
        aValue = new Date(a[sortField]);
        bValue = new Date(b[sortField]);
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [products, searchTerm, filterCategory, filterStatus, sortField, sortDirection]);

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setFilterCategory('all');
    setFilterStatus('all');
    setCurrentPage(1);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
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

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'available': return 'pm-badge-available';
      case 'pending': return 'pm-badge-pending';
      case 'not_available': return 'pm-badge-not-available';
      default: return 'pm-badge-default';
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // Handle edit product
  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setEditForm({
      product_name: product.product_name || '',
      product_description: product.product_description || '',
      product_price: product.product_price || '',
      product_quantity: product.product_quantity || '',
      product_category_id: product.product_category_id?._id || '',
      product_status: product.product_status || 'available'
    });
    setEditErrors({});
    setShowEditModal(true);
  };

  // Validate edit form
  const validateEditForm = () => {
    const errors = {};

    if (!editForm.product_name?.trim()) {
      errors.product_name = 'Tên sản phẩm không được để trống';
    }

    if (!editForm.product_price || editForm.product_price <= 0) {
      errors.product_price = 'Giá sản phẩm phải lớn hơn 0';
    }

    if (!editForm.product_quantity || editForm.product_quantity < 0) {
      errors.product_quantity = 'Số lượng không được âm';
    }

    if (!editForm.product_category_id) {
      errors.product_category_id = 'Vui lòng chọn danh mục';
    }

    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle edit form change
  const handleEditFormChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field
    if (editErrors[field]) {
      setEditErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Submit edit form
  const handleEditSubmit = async () => {
    if (!validateEditForm()) {
      return;
    }

    setEditLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const updateData = {
        product_name: editForm.product_name.trim(),
        product_description: editForm.product_description.trim(),
        product_price: parseFloat(editForm.product_price),
        product_quantity: parseInt(editForm.product_quantity),
        product_category_id: editForm.product_category_id,
        product_status: editForm.product_status
      };

      await axios.put(`${baseUrl}/reptitist/shop/my-products/${selectedProduct._id}`, updateData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      toast.success('Cập nhật sản phẩm thành công!');
      setShowEditModal(false);
      setSelectedProduct(null);
      setEditForm({
        product_name: '',
        product_description: '',
        product_price: '',
        product_quantity: '',
        product_category_id: '',
        product_status: 'available'
      });
      
      // Refresh data
      await Promise.all([fetchProducts(), fetchStats()]);
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Không thể cập nhật sản phẩm');
    } finally {
      setEditLoading(false);
    }
  };

  // Delete product
  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;

    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      await axios.delete(`${baseUrl}/reptitist/shop/my-products/${selectedProduct._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Xóa sản phẩm thành công!');
      setShowDeleteModal(false);
      setSelectedProduct(null);
      
      // Refresh data
      await Promise.all([fetchProducts(), fetchStats()]);
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Không thể xóa sản phẩm');
    }
  };

  // Loading state
  if (loading) {
    return (
      <>
        <Header />
        <div className="pm-container">
          <div className="pm-loading-state">
            <div className="pm-spinner"></div>
            <h3>Đang tải dữ liệu...</h3>
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

      <div className="pm-container">
        {/* Page Header */}
        <div className="pm-page-header">
          <div className="pm-page-header-content">
            <div className="pm-page-header-text">
              <h1>
                <i className="fas fa-boxes"></i>
                Quản lý sản phẩm
              </h1>
              <p>Quản lý tất cả sản phẩm trong cửa hàng của bạn</p>
              <div className="pm-header-breadcrumb">
                <Link to="/">Trang chủ</Link>
                <i className="fas fa-chevron-right"></i>
                <Link to="/ShopDashboard">Dashboard</Link>
                <i className="fas fa-chevron-right"></i>
                <span>Quản lý sản phẩm</span>
              </div>
            </div>
            <div className="pm-header-actions">
              <Link to="/shop/products/create" className="pm-btn pm-btn-primary">
                <i className="fas fa-plus"></i>
                Thêm sản phẩm
              </Link>
            </div>
          </div>
        </div>

        {/* ✅ Updated Statistics Dashboard */}
        <div className="pm-stats-dashboard">
          <div className="pm-stats-grid">
            <div className="pm-stat-card pm-stat-total">
              <div className="pm-stat-icon">
                <i className="fas fa-cube"></i>
              </div>
              <div className="pm-stat-content">
                <span className="pm-stat-number">{formatNumber(stats.totalProducts)}</span>
                <span className="pm-stat-label">Tổng sản phẩm</span>
              </div>
            </div>

            <div className="pm-stat-card pm-stat-available">
              <div className="pm-stat-icon">
                <i className="fas fa-check-circle"></i>
              </div>
              <div className="pm-stat-content">
                <span className="pm-stat-number">{formatNumber(stats.activeProducts)}</span>
                <span className="pm-stat-label">Đang bán</span>
              </div>
            </div>

            <div className="pm-stat-card pm-stat-not-available">
              <div className="pm-stat-icon">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <div className="pm-stat-content">
                <span className="pm-stat-number">{formatNumber(reportedProducts)}</span>
                <span className="pm-stat-label">Bị báo cáo</span>
              </div>
            </div>

            <div className="pm-stat-card pm-stat-pending">
              <div className="pm-stat-icon">
                <i className="fas fa-pause-circle"></i>
              </div>
              <div className="pm-stat-content">
                <span className="pm-stat-number">{formatNumber(stats.draftProducts)}</span>
                <span className="pm-stat-label">Ngừng bán</span>
              </div>
            </div>

            <div className="pm-stat-card pm-stat-out-of-stock">
              <div className="pm-stat-icon">
                <i className="fas fa-times-circle"></i>
              </div>
              <div className="pm-stat-content">
                <span className="pm-stat-number">{formatNumber(outOfStockProducts)}</span>
                <span className="pm-stat-label">Hết hàng</span>
              </div>
            </div>

            <div className="pm-stat-card pm-stat-categories">
              <div className="pm-stat-icon">
                <i className="fas fa-money-bill-wave"></i>
              </div>
              <div className="pm-stat-content">
                <span className="pm-stat-number">{formatInventoryValue(stats.totalValue)}</span>
                <span className="pm-stat-label">Giá trị kho hàng</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="pm-filters-section">
          <div className="pm-filters-row">
            <div className="pm-search-box">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Tìm kiếm sản phẩm theo tên, mô tả hoặc ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pm-search-input"
              />
              <i className="fas fa-search pm-search-icon"></i>
            </div>

            <div className="pm-filter-group">
              <label>Danh mục:</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="pm-filter-select"
              >
                <option value="all">Tất cả danh mục</option>
                {categories.map(category => (
                  <option key={category._id} value={category._id}>
                    {category.product_category_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="pm-filter-group">
              <label>Trạng thái:</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pm-filter-select"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="available">Đang bán</option>
                <option value="not_available">Ngừng bán</option>
                <option value="pending">Chờ duyệt</option>
              </select>
            </div>

            <div className="pm-filter-group">
              <label>Hiển thị:</label>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="pm-filter-select"
              >
                <option value={10}>10 mục</option>
                <option value={25}>25 mục</option>
                <option value={50}>50 mục</option>
              </select>
            </div>

            <button
              onClick={resetFilters}
              className="pm-btn pm-btn-secondary pm-reset-btn"
            >
              <i className="fas fa-undo"></i>
              Đặt lại
            </button>
          </div>

          {/* Filter Summary */}
          {(searchTerm || filterCategory !== 'all' || filterStatus !== 'all') && (
            <div className="pm-filter-summary">
              <div className="pm-filter-results">
                <span>Hiển thị {filteredProducts.length} / {products.length} sản phẩm</span>
              </div>
              <div className="pm-filter-tags">
                {searchTerm && (
                  <span className="pm-filter-tag">
                    <i className="fas fa-search"></i>"{searchTerm}"
                    <button onClick={() => setSearchTerm('')}>×</button>
                  </span>
                )}
                {filterCategory !== 'all' && (
                  <span className="pm-filter-tag">
                    <i className="fas fa-tag"></i>
                    {categories.find(c => c._id === filterCategory)?.product_category_name || 'Danh mục'}
                    <button onClick={() => setFilterCategory('all')}>×</button>
                  </span>
                )}
                {filterStatus !== 'all' && (
                  <span className="pm-filter-tag">
                    <i className="fas fa-toggle-on"></i>
                    {filterStatus === 'available' ? 'Đang bán' : 
                     filterStatus === 'not_available' ? 'Ngừng bán' : 'Chờ duyệt'}
                    <button onClick={() => setFilterStatus('all')}>×</button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Products Table */}
        <div className="pm-table-section">
          {currentProducts.length === 0 ? (
            <div className="pm-empty-state">
              <i className="fas fa-box-open pm-empty-icon"></i>
              <h3>Không có sản phẩm nào</h3>
              <p>
                {searchTerm || filterCategory !== 'all' || filterStatus !== 'all'
                  ? 'Không tìm thấy sản phẩm phù hợp với bộ lọc hiện tại'
                  : 'Bạn chưa có sản phẩm nào. Hãy thêm sản phẩm đầu tiên!'
                }
              </p>
              {!searchTerm && filterCategory === 'all' && filterStatus === 'all' && (
                <Link to="/shop/products/create" className="pm-btn pm-btn-primary">
                  <i className="fas fa-plus"></i>
                  Thêm sản phẩm đầu tiên
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="pm-table-header">
                <h3>
                  <i className="fas fa-table"></i>
                  Danh sách sản phẩm ({filteredProducts.length})
                </h3>
                <div className="pm-table-actions">
                  <button
                    onClick={() => fetchProducts()}
                    className="pm-btn pm-btn-secondary pm-btn-icon"
                    title="Làm mới"
                  >
                    <i className="fas fa-sync-alt"></i>
                  </button>
                </div>
              </div>

              <div className="pm-table-container">
                <table className="pm-products-table">
                  <thead>
                    <tr>
                      <th className="pm-sortable" onClick={() => {
                        if (sortField === 'product_name') {
                          setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                        } else {
                          setSortField('product_name');
                          setSortDirection('asc');
                        }
                      }}>
                        <span>Sản phẩm</span>
                        {sortField === 'product_name' && (
                          <i className={`fas fa-sort-${sortDirection === 'asc' ? 'up' : 'down'}`}></i>
                        )}
                      </th>
                      <th>Danh mục</th>
                      <th className="pm-sortable" onClick={() => {
                        if (sortField === 'product_price') {
                          setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                        } else {
                          setSortField('product_price');
                          setSortDirection('desc');
                        }
                      }}>
                        <span>Giá bán</span>
                        {sortField === 'product_price' && (
                          <i className={`fas fa-sort-${sortDirection === 'asc' ? 'up' : 'down'}`}></i>
                        )}
                      </th>
                      <th className="pm-sortable" onClick={() => {
                        if (sortField === 'product_quantity') {
                          setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                        } else {
                          setSortField('product_quantity');
                          setSortDirection('desc');
                        }
                      }}>
                        <span>Số lượng</span>
                        {sortField === 'product_quantity' && (
                          <i className={`fas fa-sort-${sortDirection === 'asc' ? 'up' : 'down'}`}></i>
                        )}
                      </th>
                      <th>Trạng thái</th>
                      <th className="pm-sortable" onClick={() => {
                        if (sortField === 'createdAt') {
                          setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                        } else {
                          setSortField('createdAt');
                          setSortDirection('desc');
                        }
                      }}>
                        <span>Ngày tạo</span>
                        {sortField === 'createdAt' && (
                          <i className={`fas fa-sort-${sortDirection === 'asc' ? 'up' : 'down'}`}></i>
                        )}
                      </th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentProducts.map((product) => (
                      <tr key={product._id} className="pm-table-row">
                        <td className="pm-product-info">
                          <div className="pm-product-main">
                            <img
                              src={product.product_imageurl?.[0] || '/images/default-product.png'}
                              alt={product.product_name}
                              className="pm-product-image"
                              onError={(e) => {
                                e.target.src = '/images/default-product.png';
                              }}
                            />
                            <div className="pm-product-details">
                              <h4 className="pm-product-name">{product.product_name}</h4>
                              <p className="pm-product-id">ID: {product._id.slice(-8)}</p>
                              {product.product_description && (
                                <p className="pm-product-description">
                                  {product.product_description.length > 60
                                    ? `${product.product_description.substring(0, 60)}...`
                                    : product.product_description}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        <td>
                          <span className="pm-category-badge">
                            {product.product_category_id?.product_category_name || 'Chưa phân loại'}
                          </span>
                        </td>

                        <td>
                          <span className="pm-price-value">
                            {formatCurrency(product.product_price)}
                          </span>
                        </td>

                        <td>
                          <div className="pm-quantity-info">
                            <span className={`pm-quantity-value ${product.product_quantity === 0 ? 'pm-out-of-stock' : ''}`}>
                              {formatNumber(product.product_quantity)}
                            </span>
                            {product.product_quantity === 0 && (
                              <span className="pm-out-of-stock-label">Hết hàng</span>
                            )}
                          </div>
                        </td>

                        <td>
                          <div className="pm-status-container">
                            <span className={`pm-status-badge ${getStatusBadgeClass(product.product_status)}`}>
                              {product.product_status === 'available' ? 'Đang bán' :
                               product.product_status === 'not_available' ? 'Ngừng bán' :
                               product.product_status === 'pending' ? 'Chờ duyệt' : 'Không xác định'}
                            </span>
                          </div>
                        </td>

                        <td>
                          <div className="pm-date-info">
                            <span className="pm-date-value">{formatDate(product.createdAt)}</span>
                            {product.updatedAt !== product.createdAt && (
                              <small className="pm-updated-label">
                                Cập nhật: {formatDate(product.updatedAt)}
                              </small>
                            )}
                          </div>
                        </td>

                        <td>
                          <div className="pm-action-buttons">
                            <button
                              onClick={() => {
                                setSelectedProduct(product);
                                setShowDetailModal(true);
                              }}
                              className="pm-btn pm-btn-icon pm-btn-view"
                              title="Xem chi tiết"
                            >
                              <i className="fas fa-eye"></i>
                            </button>

                            <button
                              onClick={() => handleEditProduct(product)}
                              className="pm-btn pm-btn-icon pm-btn-edit"
                              title="Chỉnh sửa"
                            >
                              <i className="fas fa-edit"></i>
                            </button>

                            <button
                              onClick={() => {
                                setSelectedProduct(product);
                                setShowDeleteModal(true);
                              }}
                              className="pm-btn pm-btn-icon pm-btn-delete"
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pm-pagination">
                  <div className="pm-pagination-info">
                    Hiển thị {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredProducts.length)} của {filteredProducts.length} sản phẩm
                  </div>

                  <div className="pm-pagination-controls">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="pm-pagination-btn pm-pagination-prev"
                    >
                      <i className="fas fa-chevron-left"></i>
                      Trước
                    </button>

                    <div className="pm-pagination-numbers">
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
                            className={`pm-pagination-btn ${currentPage === pageNumber ? 'active' : ''}`}
                          >
                            {pageNumber}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="pm-pagination-btn pm-pagination-next"
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
      </div>

      {/* Product Detail Modal */}
      {showDetailModal && selectedProduct && (
        <div className="pm-modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="pm-modal pm-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pm-modal-header">
              <h3>
                <i className="fas fa-info-circle"></i>
                Chi tiết sản phẩm
              </h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="pm-modal-close"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="pm-modal-body pm-detail-body">
              <div className="pm-detail-grid">
                <div className="pm-detail-image">
                  <img
                    src={selectedProduct.product_imageurl?.[0] || '/images/default-product.png'}
                    alt={selectedProduct.product_name}
                    className="pm-detail-main-image"
                    onError={(e) => {
                      e.target.src = '/images/default-product.png';
                    }}
                  />
                </div>

                <div className="pm-detail-content">
                  <h2 className="pm-detail-title">{selectedProduct.product_name}</h2>
                  
                  <div className="pm-detail-fields">
                    <div className="pm-detail-field">
                      <label>ID sản phẩm:</label>
                      <span>{selectedProduct._id}</span>
                    </div>

                    <div className="pm-detail-field">
                      <label>Danh mục:</label>
                      <span>{selectedProduct.product_category_id?.product_category_name || 'Chưa phân loại'}</span>
                    </div>

                    <div className="pm-detail-field">
                      <label>Giá bán:</label>
                      <span>{formatCurrency(selectedProduct.product_price)}</span>
                    </div>

                    <div className="pm-detail-field">
                      <label>Số lượng trong kho:</label>
                      <span className={selectedProduct.product_quantity === 0 ? 'text-danger' : ''}>
                        {formatNumber(selectedProduct.product_quantity)}
                        {selectedProduct.product_quantity === 0 && ' (Hết hàng)'}
                      </span>
                    </div>

                    <div className="pm-detail-field">
                      <label>Trạng thái:</label>
                      <span className={`pm-status-badge ${getStatusBadgeClass(selectedProduct.product_status)}`}>
                        {selectedProduct.product_status === 'available' ? 'Đang bán' :
                         selectedProduct.product_status === 'not_available' ? 'Ngừng bán' :
                         selectedProduct.product_status === 'pending' ? 'Chờ duyệt' : 'Không xác định'}
                      </span>
                    </div>

                    <div className="pm-detail-field">
                      <label>Ngày tạo:</label>
                      <span>{formatDate(selectedProduct.createdAt)}</span>
                    </div>

                    <div className="pm-detail-field">
                      <label>Cập nhật lần cuối:</label>
                      <span>{formatDate(selectedProduct.updatedAt)}</span>
                    </div>

                    {selectedProduct.product_description && (
                      <div className="pm-detail-field pm-detail-description">
                        <label>Mô tả sản phẩm:</label>
                        <p>{selectedProduct.product_description}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="pm-modal-footer">
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  handleEditProduct(selectedProduct);
                }}
                className="pm-btn pm-btn-primary"
              >
                <i className="fas fa-edit"></i>
                Chỉnh sửa
              </button>
              <button
                onClick={() => setShowDetailModal(false)}
                className="pm-btn pm-btn-secondary"
              >
                <i className="fas fa-times"></i>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal - Consistent with Detail Modal Structure */}
      {showEditModal && selectedProduct && (
        <div className="pm-modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="pm-modal pm-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pm-modal-header">
              <h3>
                <i className="fas fa-edit"></i>
                Chỉnh sửa sản phẩm
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="pm-modal-close"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="pm-modal-body pm-detail-body">
              <div className="pm-edit-grid">
                <div className="pm-edit-image">
                  <img
                    src={selectedProduct.product_imageurl?.[0] || '/images/default-product.png'}
                    alt={selectedProduct.product_name}
                    className="pm-edit-main-image"
                    onError={(e) => {
                      e.target.src = '/images/default-product.png';
                    }}
                  />
                </div>

                <div className="pm-edit-content">
                  <h4 className="pm-detail-title">Thông tin sản phẩm</h4>
                  
                  <div className="pm-edit-fields">
                    <div className="pm-edit-field">
                      <label className="pm-edit-label">
                        <i className="fas fa-tag"></i>
                        Tên sản phẩm *
                      </label>
                      <input
                        type="text"
                        value={editForm.product_name}
                        onChange={(e) => handleEditFormChange('product_name', e.target.value)}
                        className={`pm-edit-input ${editErrors.product_name ? 'pm-error' : ''}`}
                        placeholder="Nhập tên sản phẩm"
                      />
                      {editErrors.product_name && (
                        <div className="pm-error-message">
                          <i className="fas fa-exclamation-circle"></i>
                          {editErrors.product_name}
                        </div>
                      )}
                    </div>

                    <div className="pm-edit-field">
                      <label className="pm-edit-label">
                        <i className="fas fa-align-left"></i>
                        Mô tả sản phẩm
                      </label>
                      <textarea
                        value={editForm.product_description}
                        onChange={(e) => handleEditFormChange('product_description', e.target.value)}
                        className="pm-edit-textarea"
                        placeholder="Nhập mô tả sản phẩm"
                        rows="4"
                      />
                    </div>

                    <div className="pm-edit-row">
                      <div className="pm-edit-field">
                        <label className="pm-edit-label">
                          <i className="fas fa-dollar-sign"></i>
                          Giá bán *
                        </label>
                        <input
                          type="number"
                          value={editForm.product_price}
                          onChange={(e) => handleEditFormChange('product_price', e.target.value)}
                          className={`pm-edit-input ${editErrors.product_price ? 'pm-error' : ''}`}
                          placeholder="0"
                          min="0"
                          step="1000"
                        />
                        {editErrors.product_price && (
                          <div className="pm-error-message">
                            <i className="fas fa-exclamation-circle"></i>
                            {editErrors.product_price}
                          </div>
                        )}
                      </div>

                      <div className="pm-edit-field">
                        <label className="pm-edit-label">
                          <i className="fas fa-boxes"></i>
                          Số lượng *
                        </label>
                        <input
                          type="number"
                          value={editForm.product_quantity}
                          onChange={(e) => handleEditFormChange('product_quantity', e.target.value)}
                          className={`pm-edit-input ${editErrors.product_quantity ? 'pm-error' : ''}`}
                          placeholder="0"
                          min="0"
                        />
                        {editErrors.product_quantity && (
                          <div className="pm-error-message">
                            <i className="fas fa-exclamation-circle"></i>
                            {editErrors.product_quantity}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pm-edit-row">
                      <div className="pm-edit-field">
                        <label className="pm-edit-label">
                          <i className="fas fa-list"></i>
                          Danh mục *
                        </label>
                        <select
                          value={editForm.product_category_id}
                          onChange={(e) => handleEditFormChange('product_category_id', e.target.value)}
                          className={`pm-edit-select ${editErrors.product_category_id ? 'pm-error' : ''}`}
                        >
                          <option value="">Chọn danh mục</option>
                          {categories.map(category => (
                            <option key={category._id} value={category._id}>
                              {category.product_category_name}
                            </option>
                          ))}
                        </select>
                        {editErrors.product_category_id && (
                          <div className="pm-error-message">
                            <i className="fas fa-exclamation-circle"></i>
                            {editErrors.product_category_id}
                          </div>
                        )}
                      </div>

                      <div className="pm-edit-field">
                        <label className="pm-edit-label">
                          <i className="fas fa-toggle-on"></i>
                          Trạng thái
                        </label>
                        <select
                          value={editForm.product_status}
                          onChange={(e) => handleEditFormChange('product_status', e.target.value)}
                          className="pm-edit-select"
                        >
                          <option value="available">Đang bán</option>
                          <option value="pending">Chờ duyệt</option>
                          <option value="not_available">Ngừng bán</option>
                        </select>
                      </div>
                    </div>

                    <div className="pm-edit-field">
                      <label className="pm-edit-label">
                        <i className="fas fa-info-circle"></i>
                        Thông tin bổ sung
                      </label>
                      <div className="pm-detail-fields">
                        <div className="pm-detail-field">
                          <label>Mã sản phẩm:</label>
                          <span>{selectedProduct._id}</span>
                        </div>
                        <div className="pm-detail-field">
                          <label>Ngày tạo:</label>
                          <span>{formatDate(selectedProduct.createdAt)}</span>
                        </div>
                        {selectedProduct.updatedAt && selectedProduct.updatedAt !== selectedProduct.createdAt && (
                          <div className="pm-detail-field">
                            <label>Cập nhật cuối:</label>
                            <span>{formatDate(selectedProduct.updatedAt)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pm-modal-footer">
              <button
                onClick={() => setShowEditModal(false)}
                className="pm-btn pm-btn-secondary"
                disabled={editLoading}
              >
                <i className="fas fa-times"></i>
                Hủy
              </button>
              <button
                onClick={handleEditSubmit}
                className="pm-btn pm-btn-primary"
                disabled={editLoading}
              >
                {editLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save"></i>
                    Lưu thay đổi
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedProduct && (
        <div className="pm-modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="pm-modal pm-delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pm-modal-header">
              <h3>
                <i className="fas fa-trash-alt"></i>
                Xác nhận xóa sản phẩm
              </h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="pm-modal-close"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="pm-modal-body">
              <div className="pm-delete-warning">
                <p>Bạn có chắc chắn muốn xóa sản phẩm này không? Hành động này không thể hoàn tác.</p>
                
                <div className="pm-product-preview">
                  <img
                    src={selectedProduct.product_imageurl?.[0] || '/images/default-product.png'}
                    alt={selectedProduct.product_name}
                    className="pm-preview-image"
                    onError={(e) => {
                      e.target.src = '/images/default-product.png';
                    }}
                  />
                  <div className="pm-preview-info">
                    <h4>{selectedProduct.product_name}</h4>
                    <p>Giá: {formatCurrency(selectedProduct.product_price)}</p>
                    <p>Số lượng: {formatNumber(selectedProduct.product_quantity)}</p>
                    <p>Danh mục: {selectedProduct.product_category_id?.product_category_name || 'Chưa phân loại'}</p>
                  </div>
                </div>

                <div className="pm-warning-text">
                  <i className="fas fa-exclamation-triangle"></i>
                  Sản phẩm sẽ bị xóa vĩnh viễn khỏi hệ thống
                </div>
              </div>
            </div>

            <div className="pm-modal-footer">
              <button
                onClick={handleDeleteProduct}
                className="pm-btn pm-btn-danger"
              >
                <i className="fas fa-trash"></i>
                Xóa sản phẩm
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="pm-btn pm-btn-secondary"
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

export default ShopProductManagement;