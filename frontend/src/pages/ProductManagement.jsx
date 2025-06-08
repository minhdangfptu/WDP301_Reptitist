import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import axios from 'axios';
import '../css/ProductManagement.css';

const ProductManagement = () => {
  const { user, hasRole } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showProductDetailModal, setShowProductDetailModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    pending: 0,
    notAvailable: 0,
    categories: 0,
    outOfStock: 0,
    bestSelling: []
  });

  const [categoryForm, setCategoryForm] = useState({
    product_category_name: '',
    product_category_imageurl: ''
  });

  const searchInputRef = useRef(null);

  // Check admin permission
  useEffect(() => {
    if (!hasRole('admin')) {
      toast.error('Bạn không có quyền truy cập trang này');
      return;
    }
    fetchProducts();
    fetchCategories();
    fetchStats();
  }, [hasRole]);

  // Auto-focus search input
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Phiên đăng nhập đã hết hạn');
        return;
      }

      // Fetch all products from different categories
      const categoriesResponse = await axios.get('http://localhost:8080/reptitist/shop/category');
      const allProducts = [];

      for (const category of categoriesResponse.data) {
        try {
          const productsResponse = await axios.get(
            `http://localhost:8080/reptitist/shop/products/category/${category._id}`
          );
          allProducts.push(...productsResponse.data);
        } catch (error) {
          console.log(`No products found for category ${category._id}`);
        }
      }

      setProducts(allProducts);
      setFilteredProducts(allProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Không thể tải danh sách sản phẩm');
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:8080/reptitist/shop/category');
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Không thể tải danh sách danh mục');
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const productsCount = products.length;
      const availableCount = products.filter(p => p.product_status === 'available').length;
      const pendingCount = products.filter(p => p.product_status === 'pending').length;
      const notAvailableCount = products.filter(p => p.product_status === 'not_available').length;
      const outOfStockCount = products.filter(p => p.product_quantity === 0).length;

      setStats({
        total: productsCount,
        available: availableCount,
        pending: pendingCount,
        notAvailable: notAvailableCount,
        categories: categories.length,
        outOfStock: outOfStockCount,
        bestSelling: []
      });
    } catch (error) {
      console.error('Error calculating stats:', error);
    }
  };

  // Update stats when products or categories change
  useEffect(() => {
    fetchStats();
  }, [products, categories]);

  // Filter by date range
  const filterByDateRange = (products, dateFilter) => {
    if (dateFilter === 'all') return products;

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
        return products;
    }

    return products.filter(product => {
      const productDate = new Date(product.createdAt);
      return productDate >= startDate;
    });
  };

  // Enhanced filter and search functionality
  useEffect(() => {
    let filtered = [...products];

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(product =>
        product.product_name.toLowerCase().includes(searchLower) ||
        product._id.toLowerCase().includes(searchLower) ||
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

      if (sortField === 'createdAt') {
        aValue = new Date(a.createdAt);
        bValue = new Date(b.createdAt);
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
  }, [products, searchTerm, filterCategory, filterStatus, filterDate, sortField, sortDirection]);

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
    try {
      const response = await axios.delete(
        `http://localhost:8080/reptitist/shop/products/${selectedProduct._id}`
      );

      if (response.status === 200) {
        toast.success('Xóa sản phẩm thành công');
        fetchProducts();
        setShowDeleteModal(false);
        setSelectedProduct(null);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Có lỗi xảy ra khi xóa sản phẩm');
    }
  };

  // Handle update product status
  const updateProductStatus = async (productId, newStatus) => {
    try {
      const response = await axios.put(
        `http://localhost:8080/reptitist/shop/product-status/${productId}`,
        { product_status: newStatus },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 200) {
        toast.success('Cập nhật trạng thái sản phẩm thành công');
        fetchProducts();
      }
    } catch (error) {
      console.error('Error updating product status:', error);
      toast.error('Có lỗi xảy ra khi cập nhật trạng thái');
    }
  };

  // Handle create category
  const handleCreateCategory = async () => {
    try {
      if (!categoryForm.product_category_name.trim()) {
        toast.error('Vui lòng nhập tên danh mục');
        return;
      }

      const response = await axios.post(
        'http://localhost:8080/reptitist/shop/create-category',
        categoryForm,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 201) {
        toast.success('Tạo danh mục thành công');
        fetchCategories();
        setShowCategoryModal(false);
        setCategoryForm({
          product_category_name: '',
          product_category_imageurl: ''
        });
      }
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi tạo danh mục');
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

  // Check admin access
  if (!hasRole('admin')) {
    return (
      <>
        <Header />
        <div className="pm-container">
          <div className="pm-no-access">
            <i className="fas fa-exclamation-triangle pm-warning-icon"></i>
            <h2>Không có quyền truy cập</h2>
            <p>Bạn không có quyền xem trang này. Chỉ có Admin mới có thể truy cập.</p>
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
              <button 
                onClick={() => setShowCategoryModal(true)}
                className="pm-btn pm-btn-secondary"
              >
                <i className="fas fa-tags"></i>
                Quản lý danh mục
              </button>
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
                <span className="pm-stat-percentage">{stats.total ? Math.round((stats.available / stats.total) * 100) : 0}%</span>
              </div>
            </div>

            <div className="pm-stat-card pm-stat-pending">
              <div className="pm-stat-icon">
                <i className="fas fa-clock"></i>
              </div>
              <div className="pm-stat-content">
                <span className="pm-stat-number">{stats.pending}</span>
                <span className="pm-stat-label">Chờ duyệt</span>
                <span className="pm-stat-percentage">{stats.total ? Math.round((stats.pending / stats.total) * 100) : 0}%</span>
              </div>
            </div>

            <div className="pm-stat-card pm-stat-categories">
              <div className="pm-stat-icon">
                <i className="fas fa-tags"></i>
              </div>
              <div className="pm-stat-content">
                <span className="pm-stat-number">{stats.categories}</span>
                <span className="pm-stat-label">Danh mục</span>
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
              <label>Thời gian tạo:</label>
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
              <p>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
              <button onClick={resetFilters} className="pm-btn pm-btn-primary">
                <i className="fas fa-refresh"></i>
                Đặt lại bộ lọc
              </button>
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
                    onClick={() => window.location.reload()} 
                    className="pm-btn pm-btn-secondary"
                    title="Làm mới dữ liệu"
                  >
                    <i className="fas fa-sync-alt"></i>
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
                    {currentProducts.map(product => (
                      <tr key={product._id} className="pm-table-row">
                        <td>
                          <div className="pm-product-info">
                            <div className="pm-product-image">
                              <img
                                src={product.product_imageurl?.[0] || "/api/placeholder/64/64"}
                                alt={product.product_name}
                                className="pm-product-avatar"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "/api/placeholder/64/64";
                                }}
                              />
                            </div>
                            <div className="pm-product-details">
                              <span className="pm-product-name">{product.product_name}</span>
                              <small className="pm-product-id">ID: {product._id.slice(-8)}</small>
                              {product.product_quantity === 0 && (
                              <small className="pm-stock-status">Hết hàng</small>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="pm-status-container">
                            <span className={`pm-status-badge ${getStatusBadgeColor(product.product_status)}`}>
                              <i className={`fas ${product.product_status === 'available' ? 'fa-check-circle' : 
                                           product.product_status === 'pending' ? 'fa-clock' : 'fa-ban'}`}></i>
                              {product.product_status === 'available' ? 'Đang bán' : 
                               product.product_status === 'pending' ? 'Chờ duyệt' : 'Ngừng bán'}
                            </span>
                            <select
                              value={product.product_status}
                              onChange={(e) => updateProductStatus(product._id, e.target.value)}
                              className="pm-status-select"
                            >
                              <option value="available">Đang bán</option>
                              <option value="pending">Chờ duyệt</option>
                              <option value="not_available">Ngừng bán</option>
                            </select>
                          </div>
                        </td>
                        <td>
                          <div className="pm-date-info">
                            <span className="pm-date">
                              <i className="fas fa-calendar-plus"></i>
                              {formatDate(product.createdAt)}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="pm-action-buttons">
                            <button
                              onClick={() => handleViewProductDetails(product)}
                              className="pm-btn-action pm-btn-view"
                              title="Xem chi tiết"
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            <Link
                              to={`/admin/products/edit/${product._id}`}
                              className="pm-btn-action pm-btn-edit"
                              title="Chỉnh sửa"
                            >
                              <i className="fas fa-edit"></i>
                            </Link>
                            <button
                              onClick={() => handleDeleteProduct(product)}
                              className="pm-btn-action pm-btn-delete"
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
                <div className="pm-pagination">
                  <div className="pm-pagination-info">
                    Hiển thị {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredProducts.length)} 
                    trong tổng số {filteredProducts.length} sản phẩm
                  </div>
                  <div className="pm-pagination-controls">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="pm-pagination-btn"
                    >
                      <i className="fas fa-chevron-left"></i>
                    </button>
                    
                    {renderPagination()}
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="pm-pagination-btn"
                    >
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
      {showProductDetailModal && selectedProduct && (
        <div className="pm-modal-overlay">
          <div className="pm-modal-content pm-product-detail-modal">
            <div className="pm-modal-header">
              <h2>Chi tiết sản phẩm</h2>
              <button onClick={() => setShowProductDetailModal(false)} className="pm-modal-close">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="pm-modal-body">
              <div className="pm-product-detail-content">
                <div className="pm-product-images">
                  <div className="pm-main-image">
                    <img
                      src={selectedProduct.product_imageurl?.[0] || "/api/placeholder/300/300"}
                      alt={selectedProduct.product_name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/api/placeholder/300/300";
                      }}
                    />
                  </div>
                  {selectedProduct.product_imageurl?.length > 1 && (
                    <div className="pm-thumbnail-images">
                      {selectedProduct.product_imageurl.slice(0, 4).map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`${selectedProduct.product_name} ${index + 1}`}
                          className="pm-thumbnail"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/api/placeholder/80/80";
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div className="pm-product-info-detail">
                  <h3>{selectedProduct.product_name}</h3>
                  <div className="pm-detail-grid">
                    <div className="pm-detail-item">
                      <label>Mã sản phẩm:</label>
                      <span>{selectedProduct._id}</span>
                    </div>
                    <div className="pm-detail-item">
                      <label>Danh mục:</label>
                      <span>{getCategoryName(selectedProduct.product_category_id)}</span>
                    </div>
                    <div className="pm-detail-item">
                      <label>Giá:</label>
                      <span className="pm-price-large">{formatCurrency(selectedProduct.product_price)}</span>
                    </div>
                    <div className="pm-detail-item">
                      <label>Số lượng:</label>
                      <span className={selectedProduct.product_quantity === 0 ? 'pm-out-of-stock' : ''}>
                        {selectedProduct.product_quantity}
                      </span>
                    </div>
                    <div className="pm-detail-item">
                      <label>Trạng thái:</label>
                      <span className={`pm-status-badge ${getStatusBadgeColor(selectedProduct.product_status)}`}>
                        {selectedProduct.product_status === 'available' ? 'Đang bán' : 
                         selectedProduct.product_status === 'pending' ? 'Chờ duyệt' : 'Ngừng bán'}
                      </span>
                    </div>
                    <div className="pm-detail-item">
                      <label>Đánh giá:</label>
                      <span className="pm-rating-detail">
                        <i className="fas fa-star"></i>
                        {selectedProduct.average_rating ? selectedProduct.average_rating.toFixed(1) : '0.0'}
                      </span>
                    </div>
                    <div className="pm-detail-item">
                      <label>Ngày tạo:</label>
                      <span>{formatDate(selectedProduct.createdAt)}</span>
                    </div>
                    <div className="pm-detail-item">
                      <label>Ngày cập nhật:</label>
                      <span>{formatDate(selectedProduct.updatedAt)}</span>
                    </div>
                  </div>

                  {selectedProduct.product_description && (
                    <div className="pm-description-section">
                      <h4>Mô tả sản phẩm:</h4>
                      <p>{selectedProduct.product_description}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="pm-modal-footer">
              <Link
                to={`/admin/products/edit/${selectedProduct._id}`}
                className="pm-btn pm-btn-primary"
              >
                <i className="fas fa-edit"></i>
                Chỉnh sửa sản phẩm
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

      {/* Category Management Modal */}
      {showCategoryModal && (
        <div className="pm-modal-overlay">
          <div className="pm-modal-content pm-category-modal">
            <div className="pm-modal-header">
              <h2>Quản lý danh mục</h2>
              <button onClick={() => setShowCategoryModal(false)} className="pm-modal-close">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="pm-modal-body">
              <div className="pm-category-form">
                <h4>Thêm danh mục mới</h4>
                <div className="pm-form-group">
                  <label>Tên danh mục:</label>
                  <input
                    type="text"
                    value={categoryForm.product_category_name}
                    onChange={(e) => setCategoryForm({
                      ...categoryForm,
                      product_category_name: e.target.value
                    })}
                    placeholder="Nhập tên danh mục"
                    className="pm-form-input"
                  />
                </div>
                <div className="pm-form-group">
                  <label>URL hình ảnh:</label>
                  <input
                    type="text"
                    value={categoryForm.product_category_imageurl}
                    onChange={(e) => setCategoryForm({
                      ...categoryForm,
                      product_category_imageurl: e.target.value
                    })}
                    placeholder="Nhập URL hình ảnh danh mục"
                    className="pm-form-input"
                  />
                </div>
                <button
                  onClick={handleCreateCategory}
                  className="pm-btn pm-btn-primary"
                >
                  <i className="fas fa-plus"></i>
                  Thêm danh mục
                </button>
              </div>

              <div className="pm-category-list">
                <h4>Danh sách danh mục hiện có</h4>
                <div className="pm-category-grid">
                  {categories.map(category => (
                    <div key={category._id} className="pm-category-card">
                      <div className="pm-category-image">
                        <img
                          src={category.product_category_imageurl || "/api/placeholder/80/80"}
                          alt={category.product_category_name}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/api/placeholder/80/80";
                          }}
                        />
                      </div>
                      <div className="pm-category-info">
                        <h5>{category.product_category_name}</h5>
                        <small>ID: {category._id.slice(-8)}</small>
                      </div>
                      <div className="pm-category-actions">
                        <button
                          className="pm-btn-action pm-btn-edit"
                          title="Chỉnh sửa"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className="pm-btn-action pm-btn-delete"
                          title="Xóa"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="pm-modal-footer">
              <button
                onClick={() => setShowCategoryModal(false)}
                className="pm-btn pm-btn-secondary"
              >
                <i className="fas fa-times"></i>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedProduct && (
        <div className="pm-modal-overlay">
          <div className="pm-modal-content pm-delete-modal">
            <div className="pm-modal-header">
              <h2>Xác nhận xóa</h2>
              <button onClick={() => setShowDeleteModal(false)} className="pm-modal-close">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="pm-modal-body">
              <div className="pm-delete-warning">
                <i className="fas fa-exclamation-triangle pm-warning-icon"></i>
                <p>Bạn có chắc chắn muốn xóa sản phẩm này?</p>
                <p className="pm-delete-product-info">
                  <strong>{selectedProduct.product_name}</strong>
                </p>
                <p className="pm-delete-note">
                  Lưu ý: Hành động này không thể hoàn tác. Tất cả dữ liệu liên quan đến sản phẩm này sẽ bị xóa vĩnh viễn.
                </p>
              </div>
            </div>
            <div className="pm-modal-footer">
              <button
                onClick={confirmDelete}
                className="pm-btn pm-btn-danger"
              >
                <i className="fas fa-trash"></i>
                Xác nhận xóa
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

export default ProductManagement;description && (
                                <small className="pm-product-description">
                                  {product.product_description.length > 50 
                                    ? product.product_description.substring(0, 50) + '...' 
                                    : product.product_description}
                                </small>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="pm-category-name">
                            {getCategoryName(product.product_category_id)}
                          </span>
                        </td>
                        <td>
                          <div className="pm-price-info">
                            <span className="pm-price">{formatCurrency(product.product_price)}</span>
                            {product.average_rating > 0 && (
                              <small className="pm-rating">
                                <i className="fas fa-star"></i>
                                {product.average_rating.toFixed(1)}
                              </small>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="pm-quantity-info">
                            <span className={`pm-quantity ${product.product_quantity === 0 ? 'pm-out-of-stock' : ''}`}>
                              {product.product_quantity}
                            </span>
                            {product.product_