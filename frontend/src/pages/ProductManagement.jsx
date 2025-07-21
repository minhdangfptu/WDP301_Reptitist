import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import axios from 'axios';
import '../css/ProductManagement.css';
import { baseUrl } from '../config';

const ProductManagement = () => {
  const { user, hasRole } = useAuth();
  const navigate = useNavigate();
  
  // State management
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  
  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showProductDetailModal, setShowProductDetailModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    pending: 0,
    notAvailable: 0,
    categories: 0,
    outOfStock: 0
  });

  const searchInputRef = useRef(null);

  // Check permission - allow both admin and shop users
  useEffect(() => {
    if (!hasRole('admin') && !user?.account_type?.type >= 3) {
      toast.error('Bạn không có quyền truy cập trang này');
      navigate('/');
      return;
    }
    initializeData();
  }, [hasRole, user, navigate]);

  // Initialize all data
  const initializeData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchProducts(),
        fetchCategories()
      ]);
    } catch (error) {
      console.error('Error initializing data:', error);
      toast.error('Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  // Fetch products from API
  const fetchProducts = useCallback(async () => {
    try {
      let allProducts = [];
      
      if (hasRole('admin')) {
        // Admin can see all products
        const categoriesResponse = await axios.get(`${baseUrl}/reptitist/shop/category`);
        const allCategories = categoriesResponse.data || [];
        
        for (const category of allCategories) {
          try {
            const productsResponse = await axios.get(
              `${baseUrl}/reptitist/shop/products/category/${category._id}`
            );
            if (productsResponse.data && Array.isArray(productsResponse.data)) {
              allProducts.push(...productsResponse.data);
            }
          } catch (error) {
            console.log(`No products found for category ${category.product_category_name}`);
          }
        }
      } else {
        // Shop users can only see their own products
        const token = localStorage.getItem('access_token');
        const response = await axios.get(`${baseUrl}/reptitist/shop/my-products`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        allProducts = response.data.products || [];
      }

      // Remove duplicates based on _id
      const uniqueProducts = allProducts.filter((product, index, self) => 
        index === self.findIndex(p => p._id === product._id)
      );

      setProducts(uniqueProducts);
      setFilteredProducts(uniqueProducts);
      
      // Calculate stats
      const categoriesResponse = await axios.get(`${baseUrl}/reptitist/shop/category`);
      const allCategories = categoriesResponse.data || [];
      calculateStats(uniqueProducts, allCategories);
      
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Không thể tải danh sách sản phẩm');
      setProducts([]);
      setFilteredProducts([]);
    }
  }, [hasRole]);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await axios.get(`${baseUrl}/reptitist/shop/category`);
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Không thể tải danh sách danh mục');
      setCategories([]);
    }
  }, []);

  // Calculate statistics
  const calculateStats = useCallback((productsList, categoriesList) => {
    const total = productsList.length;
    const available = productsList.filter(p => p.product_status === 'available').length;
    const pending = productsList.filter(p => p.product_status === 'pending').length;
    const notAvailable = productsList.filter(p => p.product_status === 'not_available').length;
    const outOfStock = productsList.filter(p => p.product_quantity === 0).length;

    setStats({
      total,
      available,
      pending,
      notAvailable,
      categories: categoriesList.length,
      outOfStock
    });
  }, []);

  // Filter by date range
  const filterByDateRange = useCallback((productsList, dateFilter) => {
    if (dateFilter === 'all') return productsList;

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
        return productsList;
    }

    return productsList.filter(product => {
      const productDate = new Date(product.createdAt || product.updatedAt);
      return productDate >= startDate;
    });
  }, []);

  // Enhanced filter and search functionality
  useEffect(() => {
    let filtered = [...products];

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(product =>
        product.product_name?.toLowerCase().includes(searchLower) ||
        product._id?.toLowerCase().includes(searchLower) ||
        (product.product_description && product.product_description.toLowerCase().includes(searchLower))
      );
    }

    // Category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(product => product.product_category_id === filterCategory);
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(product => product.product_status === filterStatus);
    }

    // Date filter
    filtered = filterByDateRange(filtered, filterDate);

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === 'createdAt' || sortField === 'updatedAt') {
        aValue = new Date(a[sortField] || 0);
        bValue = new Date(b[sortField] || 0);
      } else if (sortField === 'product_price') {
        aValue = a.product_price || 0;
        bValue = b.product_price || 0;
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [products, searchTerm, filterCategory, filterStatus, filterDate, sortField, sortDirection, filterByDateRange]);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // Handle sorting
  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Handle view product details
  const handleViewProductDetails = (product) => {
    setSelectedProduct(product);
    setShowProductDetailModal(true);
  };

  // Handle delete product
  const handleDeleteProduct = (product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!selectedProduct) return;

    try {
      const response = await axios.delete(
        `${baseUrl}/reptitist/shop/my-products/${selectedProduct._id}`
      );

      if (response.status === 200) {
        toast.success('Xóa sản phẩm thành công');
        await fetchProducts(); // Refresh products
        setShowDeleteModal(false);
        setSelectedProduct(null);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi xóa sản phẩm');
    }
  };

  // Handle update product status
  const updateProductStatus = async (productId, newStatus) => {
    try {
      const response = await axios.put(
        `${baseUrl}/reptitist/shop/my-products/${productId}`,
        { product_status: newStatus },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 200) {
        toast.success('Cập nhật trạng thái sản phẩm thành công');
        await fetchProducts(); // Refresh products
      }
    } catch (error) {
      console.error('Error updating product status:', error);
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật trạng thái');
    }
  };



  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'N/A';
    }
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
      case 'available': return 'pm-badge-available';
      case 'pending': return 'pm-badge-pending';
      case 'not_available': return 'pm-badge-not-available';
      default: return 'pm-badge-default';
    }
  };

  // Get category name
  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat._id === categoryId);
    return category ? category.product_category_name : 'N/A';
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setFilterCategory('all');
    setFilterStatus('all');
    setFilterDate('all');
    setCurrentPage(1);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
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
          className="pm-pagination-btn"
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(
          <span key="start-dots" className="pm-pagination-dots">...</span>
        );
      }
    }

    // Visible pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`pm-pagination-btn ${currentPage === i ? 'active' : ''}`}
        >
          {i}
        </button>
      );
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="end-dots" className="pm-pagination-dots">...</span>
        );
      }
      pages.push(
        <button
          key={totalPages}
          onClick={() => setCurrentPage(totalPages)}
          className="pm-pagination-btn"
        >
          {totalPages}
        </button>
      );
    }

    return pages;
  };

  // Check access - allow both admin and shop users
  if (!hasRole('admin') && !user?.account_type?.type >= 3) {
    return (
      <>
        <Header />
        <div className="pm-container">
          <div className="pm-no-access">
            <i className="fas fa-exclamation-triangle pm-warning-icon"></i>
            <h2>Không có quyền truy cập</h2>
            <p>Bạn không có quyền xem trang này. Chỉ có Admin và Shop mới có thể truy cập.</p>
            <Link to="/" className="pm-btn pm-btn-primary">
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
      
      <div className="pm-container">
        {/* Page Header */}
        <div className="pm-page-header">
          <div className="pm-page-header-content">
            <div className="pm-page-header-text">
              <h1>
                <i className="fas fa-box"></i>
                Quản lý sản phẩm
              </h1>
              <p>Quản lý tất cả sản phẩm và danh mục trong hệ thống</p>
              <div className="pm-header-breadcrumb">
                <Link to="/">Trang chủ</Link>
                <i className="fas fa-chevron-right"></i>
                <span>Quản lý sản phẩm</span>
              </div>
            </div>
            <div className="pm-header-actions">
              <Link to="/admin/products/create" className="pm-btn pm-btn-primary">
                <i className="fas fa-plus"></i>
                Thêm sản phẩm
              </Link>
            </div>
          </div>
        </div>

        {/* Statistics Dashboard */}
        <div className="pm-stats-dashboard">
          <div className="pm-stats-grid">
            <div className="pm-stat-card pm-stat-total">
              <div className="pm-stat-icon">
                <i className="fas fa-box"></i>
              </div>
              <div className="pm-stat-content">
                <span className="pm-stat-number">{stats.total}</span>
                <span className="pm-stat-label">Tổng sản phẩm</span>
              </div>
            </div>
            
            <div className="pm-stat-card pm-stat-available">
              <div className="pm-stat-icon">
                <i className="fas fa-check-circle"></i>
              </div>
              <div className="pm-stat-content">
                <span className="pm-stat-number">{stats.available}</span>
                <span className="pm-stat-label">Đang bán</span>
                <span className="pm-stat-percentage">
                  {stats.total ? Math.round((stats.available / stats.total) * 100) : 0}%
                </span>
              </div>
            </div>

            <div className="pm-stat-card pm-stat-pending">
              <div className="pm-stat-icon">
                <i className="fas fa-clock"></i>
              </div>
              <div className="pm-stat-content">
                <span className="pm-stat-number">{stats.pending}</span>
                <span className="pm-stat-label">Chờ duyệt</span>
                <span className="pm-stat-percentage">
                  {stats.total ? Math.round((stats.pending / stats.total) * 100) : 0}%
                </span>
              </div>
            </div>

            <div className="pm-stat-card pm-stat-out-of-stock">
              <div className="pm-stat-icon">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <div className="pm-stat-content">
                <span className="pm-stat-number">{stats.outOfStock}</span>
                <span className="pm-stat-label">Hết hàng</span>
              </div>
            </div>

            <div className="pm-stat-card pm-stat-not-available">
              <div className="pm-stat-icon">
                <i className="fas fa-ban"></i>
              </div>
              <div className="pm-stat-content">
                <span className="pm-stat-number">{stats.notAvailable}</span>
                <span className="pm-stat-label">Ngừng bán</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="pm-filters-section">
          <div className="pm-filters-row">
            <div className="pm-search-box">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Tìm kiếm theo tên sản phẩm, mã sản phẩm..."
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
                <option value="pending">Chờ duyệt</option>
                <option value="not_available">Ngừng bán</option>
              </select>
            </div>

            <div className="pm-filter-group">
              <label>Thời gian:</label>
              <select
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="pm-filter-select"
              >
                <option value="all">Tất cả thời gian</option>
                <option value="today">Hôm nay</option>
                <option value="week">Tuần này</option>
                <option value="month">Tháng này</option>
                <option value="quarter">3 tháng qua</option>
                <option value="year">Năm nay</option>
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
                <option value={100}>100 mục</option>
              </select>
            </div>

            <button
              onClick={resetFilters}
              className="pm-btn pm-btn-secondary pm-reset-btn"
              title="Đặt lại bộ lọc"
            >
              <i className="fas fa-undo"></i>
              Đặt lại
            </button>
          </div>

          {/* Filter Summary */}
          {(searchTerm || filterCategory !== 'all' || filterStatus !== 'all' || filterDate !== 'all') && (
            <div className="pm-filter-summary">
              <div className="pm-filter-results">
                <span>Hiển thị {filteredProducts.length} / {products.length} sản phẩm</span>
              </div>
              <div className="pm-filter-tags">
                {searchTerm && (
                  <span className="pm-filter-tag">
                    <i className="fas fa-search"></i>
                    "{searchTerm}"
                    <button onClick={() => setSearchTerm('')}>×</button>
                  </span>
                )}
                {filterCategory !== 'all' && (
                  <span className="pm-filter-tag">
                    <i className="fas fa-tags"></i>
                    {getCategoryName(filterCategory)}
                    <button onClick={() => setFilterCategory('all')}>×</button>
                  </span>
                )}
                {filterStatus !== 'all' && (
                  <span className="pm-filter-tag">
                    <i className="fas fa-toggle-on"></i>
                    {filterStatus === 'available' ? 'Đang bán' : 
                     filterStatus === 'pending' ? 'Chờ duyệt' : 'Ngừng bán'}
                    <button onClick={() => setFilterStatus('all')}>×</button>
                  </span>
                )}
                {filterDate !== 'all' && (
                  <span className="pm-filter-tag">
                    <i className="fas fa-calendar"></i>
                    {filterDate}
                    <button onClick={() => setFilterDate('all')}>×</button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Products Table */}
        <div className="pm-table-section">
          {loading ? (
            <div className="pm-loading-state">
              <div className="pm-spinner"></div>
              <h3>Đang tải dữ liệu...</h3>
              <p>Vui lòng chờ trong giây lát</p>
            </div>
          ) : currentProducts.length === 0 ? (
            <div className="pm-empty-state">
              <i className="fas fa-box-open pm-empty-icon"></i>
              <h3>Không tìm thấy sản phẩm</h3>
              <p>
                {filteredProducts.length === 0 && products.length === 0 
                  ? 'Chưa có sản phẩm nào trong hệ thống' 
                  : 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
                }
              </p>
              {filteredProducts.length === 0 && products.length > 0 ? (
                <button onClick={resetFilters} className="pm-btn pm-btn-primary">
                  <i className="fas fa-refresh"></i>
                  Đặt lại bộ lọc
                </button>
              ) : (
                <Link to="/admin/products/create" className="pm-btn pm-btn-primary">
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
                    className="pm-btn pm-btn-secondary"
                    title="Làm mới dữ liệu"
                    disabled={loading}
                  >
                    <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''}`}></i>
                  </button>
                </div>
              </div>

              <div className="pm-table-container">
                <table className="pm-products-table">
                  <thead>
                    <tr>
                      <th onClick={() => handleSort('product_name')} className="pm-sortable">
                        <span>Thông tin sản phẩm</span>
                        {sortField === 'product_name' && (
                          <i className={`fas fa-chevron-${sortDirection === 'asc' ? 'up' : 'down'}`}></i>
                        )}
                      </th>
                      <th>Danh mục</th>
                      <th onClick={() => handleSort('product_price')} className="pm-sortable">
                        <span>Giá</span>
                        {sortField === 'product_price' && (
                          <i className={`fas fa-chevron-${sortDirection === 'asc' ? 'up' : 'down'}`}></i>
                        )}
                      </th>
                      <th>Số lượng</th>
                      <th>Trạng thái</th>
                      <th onClick={() => handleSort('createdAt')} className="pm-sortable">
                        <span>Ngày tạo</span>
                        {sortField === 'createdAt' && (
                          <i className={`fas fa-chevron-${sortDirection === 'asc' ? 'up' : 'down'}`}></i>
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
                              src={product.product_imageurl || '/default-product.png'}
                              alt={product.product_name}
                              className="pm-product-image"
                              onError={(e) => {
                                e.target.src = '/default-product.png';
                              }}
                            />
                            <div className="pm-product-details">
                              <h4 className="pm-product-name" title={product.product_name}>
                                {product.product_name}
                              </h4>
                              <p className="pm-product-id">ID: {product._id}</p>
                              {product.product_description && (
                                <p className="pm-product-description" title={product.product_description}>
                                  {product.product_description.length > 50 
                                    ? `${product.product_description.substring(0, 50)}...` 
                                    : product.product_description
                                  }
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        
                        <td className="pm-category">
                          <span className="pm-category-badge">
                            {getCategoryName(product.product_category_id)}
                          </span>
                        </td>
                        
                        <td className="pm-price">
                          <span className="pm-price-value">
                            {formatCurrency(product.product_price)}
                          </span>
                        </td>
                        
                        <td className="pm-quantity">
                          <div className="pm-quantity-info">
                            <span className={`pm-quantity-value ${product.product_quantity === 0 ? 'pm-out-of-stock' : ''}`}>
                              {product.product_quantity || 0}
                            </span>
                            {product.product_quantity === 0 && (
                              <span className="pm-out-of-stock-label">Hết hàng</span>
                            )}
                          </div>
                        </td>
                        
                        <td className="pm-status">
                          <div className="pm-status-container">
                            <span className={`pm-status-badge ${getStatusBadgeColor(product.product_status)}`}>
                              {product.product_status === 'available' ? 'Đang bán' :
                               product.product_status === 'pending' ? 'Chờ duyệt' :
                               product.product_status === 'not_available' ? 'Ngừng bán' : 'N/A'}
                            </span>
                            <div className="pm-status-actions">
                              <select
                                value={product.product_status}
                                onChange={(e) => updateProductStatus(product._id, e.target.value)}
                                className="pm-status-select"
                                title="Thay đổi trạng thái"
                              >
                                <option value="available">Đang bán</option>
                                <option value="pending">Chờ duyệt</option>
                                <option value="not_available">Ngừng bán</option>
                              </select>
                            </div>
                          </div>
                        </td>
                        
                        <td className="pm-date">
                          <div className="pm-date-info">
                            <span className="pm-date-value">
                              {formatDate(product.createdAt)}
                            </span>
                            {product.updatedAt && product.updatedAt !== product.createdAt && (
                              <span className="pm-updated-label">
                                Sửa: {formatDate(product.updatedAt)}
                              </span>
                            )}
                          </div>
                        </td>
                        
                        <td className="pm-actions">
                          <div className="pm-action-buttons">
                            <button
                              onClick={() => handleViewProductDetails(product)}
                              className="pm-btn pm-btn-icon pm-btn-view"
                              title="Xem chi tiết"
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            
                            <Link
                              to={`/admin/products/edit/${product._id}`}
                              className="pm-btn pm-btn-icon pm-btn-edit"
                              title="Chỉnh sửa"
                            >
                              <i className="fas fa-edit"></i>
                            </Link>
                            
                            <button
                              onClick={() => handleDeleteProduct(product)}
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
                      {renderPagination()}
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

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedProduct && (
          <div className="pm-modal-overlay" onClick={() => setShowDeleteModal(false)}>
            <div className="pm-modal pm-delete-modal" onClick={(e) => e.stopPropagation()}>
              <div className="pm-modal-header">
                <h3>
                  <i className="fas fa-exclamation-triangle"></i>
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
                  <p>Bạn có chắc chắn muốn xóa sản phẩm này không?</p>
                  <div className="pm-product-preview">
                    <img 
                      src={selectedProduct.product_imageurl || '/default-product.png'} 
                      alt={selectedProduct.product_name}
                      className="pm-preview-image"
                    />
                    <div className="pm-preview-info">
                      <h4>{selectedProduct.product_name}</h4>
                      <p>ID: {selectedProduct._id}</p>
                      <p>Giá: {formatCurrency(selectedProduct.product_price)}</p>
                    </div>
                  </div>
                  <div className="pm-warning-text">
                    <i className="fas fa-exclamation-triangle"></i>
                    <strong>Cảnh báo:</strong> Hành động này không thể hoàn tác!
                  </div>
                </div>
              </div>
              
              <div className="pm-modal-footer">
                <button 
                  onClick={() => setShowDeleteModal(false)}
                  className="pm-btn pm-btn-secondary"
                >
                  <i className="fas fa-times"></i>
                  Hủy
                </button>
                <button 
                  onClick={confirmDelete}
                  className="pm-btn pm-btn-danger"
                >
                  <i className="fas fa-trash"></i>
                  Xóa sản phẩm
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Product Detail Modal */}
        {showProductDetailModal && selectedProduct && (
          <div className="pm-modal-overlay" onClick={() => setShowProductDetailModal(false)}>
            <div className="pm-modal pm-detail-modal" onClick={(e) => e.stopPropagation()}>
              <div className="pm-modal-header">
                <h3>
                  <i className="fas fa-info-circle"></i>
                  Chi tiết sản phẩm
                </h3>
                <button 
                  onClick={() => setShowProductDetailModal(false)}
                  className="pm-modal-close"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              
              <div className="pm-modal-body pm-detail-body">
                <div className="pm-detail-grid">
                  <div className="pm-detail-image">
                    <img 
                      src={selectedProduct.product_imageurl || '/default-product.png'} 
                      alt={selectedProduct.product_name}
                      className="pm-detail-main-image"
                    />
                  </div>
                  
                  <div className="pm-detail-info">
                    <h4 className="pm-detail-title">{selectedProduct.product_name}</h4>
                    
                    <div className="pm-detail-fields">
                      <div className="pm-detail-field">
                        <label>Mã sản phẩm:</label>
                        <span>{selectedProduct._id}</span>
                      </div>
                      
                      <div className="pm-detail-field">
                        <label>Danh mục:</label>
                        <span className="pm-category-badge">
                          {getCategoryName(selectedProduct.product_category_id)}
                        </span>
                      </div>
                      
                      <div className="pm-detail-field">
                        <label>Giá bán:</label>
                        <span className="pm-price-value">
                          {formatCurrency(selectedProduct.product_price)}
                        </span>
                      </div>
                      
                      <div className="pm-detail-field">
                        <label>Số lượng:</label>
                        <span className={selectedProduct.product_quantity === 0 ? 'pm-out-of-stock' : ''}>
                          {selectedProduct.product_quantity || 0}
                          {selectedProduct.product_quantity === 0 && ' (Hết hàng)'}
                        </span>
                      </div>
                      
                      <div className="pm-detail-field">
                        <label>Trạng thái:</label>
                        <span className={`pm-status-badge ${getStatusBadgeColor(selectedProduct.product_status)}`}>
                          {selectedProduct.product_status === 'available' ? 'Đang bán' :
                           selectedProduct.product_status === 'pending' ? 'Chờ duyệt' :
                           selectedProduct.product_status === 'not_available' ? 'Ngừng bán' : 'N/A'}
                        </span>
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
                      
                      {selectedProduct.product_description && (
                        <div className="pm-detail-field pm-detail-description">
                          <label>Mô tả:</label>
                          <p>{selectedProduct.product_description}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="pm-modal-footer">
                <Link
                  to={`/admin/products/edit/${selectedProduct._id}`}
                  className="pm-btn pm-btn-primary"
                >
                  <i className="fas fa-edit"></i>
                  Chỉnh sửa
                </Link>
                <button 
                  onClick={() => setShowProductDetailModal(false)}
                  className="pm-btn pm-btn-secondary"
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

export default ProductManagement;