import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import "../css/ProductManagement.css";
import { baseUrl } from '../config';

const ShopProductManagement = () => {
  const { user, hasRole } = useAuth();
  const navigate = useNavigate();

  // State management
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDate, setFilterDate] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [sortField, setSortField] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showProductDetailModal, setShowProductDetailModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [editErrors, setEditErrors] = useState({});
  const [editLoading, setEditLoading] = useState(false);



  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    reported: 0,
    notAvailable: 0,
    outOfStock: 0,
    inventoryValue: 0,
  });

  const searchInputRef = useRef(null);

  // Check shop permission
  useEffect(() => {
    initializeData();
  }, []);

  // Initialize all data
  const initializeData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchMyProducts(), fetchCategories(), fetchMyStats()]);
    } catch (error) {
      console.error("Error initializing data:", error);
      toast.error("Có lỗi xảy ra khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  // Fetch my products from API
  const fetchMyProducts = useCallback(async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.error('No token found');
        return;
      }
      const response = await axios.get(
        `${baseUrl}/reptitist/shop/my-products`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Tự động nhận cả hai kiểu trả về
      const data = Array.isArray(response.data) ? response.data : response.data.products || [];
      setProducts(data);
      setFilteredProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
      setFilteredProducts([]);
    }
  }, []);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await axios.get(`${baseUrl}/reptitist/shop/category`);
      setCategories(response.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
    }
  }, []);

  // Fetch my statistics
  const fetchMyStats = useCallback(async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      const response = await axios.get(`${baseUrl}/reptitist/shop/my-stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Nếu response trả về object có key data thì lấy response.data.data, nếu không thì lấy response.data
      const statsData = response.data?.data || response.data;
      if (statsData) {
        setStats(prev => ({
          ...prev,
          ...statsData,
          inventoryValue: statsData.inventoryValue ?? statsData.totalValue ?? 0
        }));
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  // Filter by date range
  const filterByDateRange = useCallback((productsList, dateFilter) => {
    if (dateFilter === "all") return productsList;

    const now = new Date();
    const startDate = new Date();

    switch (dateFilter) {
      case "today":
        startDate.setHours(0, 0, 0, 0);
        break;
      case "week":
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "quarter":
        startDate.setMonth(now.getMonth() - 3);
        break;
      case "year":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return productsList;
    }

    return productsList.filter((product) => {
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
      filtered = filtered.filter(
        (product) =>
          product.product_name?.toLowerCase().includes(searchLower) ||
          product._id?.toLowerCase().includes(searchLower) ||
          (product.product_description &&
            product.product_description.toLowerCase().includes(searchLower))
      );
    }

    // Category filter
    if (filterCategory !== "all") {
      filtered = filtered.filter(
        (product) => product.product_category_id?._id === filterCategory
      );
    }

    // Status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter(
        (product) => product.product_status === filterStatus
      );
    }

    // Date filter
    filtered = filterByDateRange(filtered, filterDate);

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === "createdAt" || sortField === "updatedAt") {
        aValue = new Date(a[sortField] || 0);
        bValue = new Date(b[sortField] || 0);
      } else if (sortField === "product_price") {
        aValue = a.product_price || 0;
        bValue = b.product_price || 0;
      }

      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [
    products,
    searchTerm,
    filterCategory,
    filterStatus,
    filterDate,
    sortField,
    sortDirection,
    filterByDateRange,
  ]);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // Handle sorting
  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Handle view product details
  const handleViewProductDetails = (product) => {
    setSelectedProduct(product);
    setShowProductDetailModal(true);
    setIsEditMode(false);
  };

  // Handle edit product
  const handleEditProduct = (product) => {
    console.log('handleEditProduct called with product:', product._id);
    setSelectedProduct(product);
    setEditFormData({
      product_name: product.product_name || '',
      product_description: product.product_description || '',
      product_price: product.product_price ? product.product_price.toString() : '',
      product_quantity: product.product_quantity ? product.product_quantity.toString() : '',
      product_category_id: product.product_category_id?._id || product.product_category_id || '',
      product_imageurl: Array.isArray(product.product_imageurl) 
        ? product.product_imageurl[0] || '' 
        : product.product_imageurl || '',
      product_status: product.product_status || 'available'
    });
    setEditErrors({});
    setIsEditMode(true);
    setShowProductDetailModal(true);
    console.log('Modal states set - should open now');
  };

  // Handle edit form change
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for numeric fields
    if (name === 'product_price' || name === 'product_quantity') {
      const numericValue = value.replace(/\D/g, '');
      setEditFormData(prev => ({
        ...prev,
        [name]: numericValue
      }));
    } else {
      setEditFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when user starts typing
    if (editErrors[name]) {
      setEditErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate edit form
  const validateEditForm = () => {
    const errors = {};
    
    if (!editFormData.product_name?.trim()) {
      errors.product_name = 'Vui lòng nhập tên sản phẩm';
    }
    
    if (!editFormData.product_price) {
      errors.product_price = 'Vui lòng nhập giá sản phẩm';
    } else if (parseInt(editFormData.product_price) < 1000) {
      errors.product_price = 'Giá tối thiểu là 1,000 VNĐ';
    }
    
    if (!editFormData.product_quantity) {
      errors.product_quantity = 'Vui lòng nhập số lượng';
    } else if (parseInt(editFormData.product_quantity) < 0) {
      errors.product_quantity = 'Số lượng không được âm';
    }
    
    if (!editFormData.product_category_id) {
      errors.product_category_id = 'Vui lòng chọn danh mục';
    }
    
    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Edit product (PUT)
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        toast.error('Phiên đăng nhập đã hết hạn');
        navigate('/Login');
        return;
      }
      const submitData = {
        product_name: editFormData.product_name,
        product_description: editFormData.product_description,
        product_price: parseInt(editFormData.product_price),
        product_quantity: parseInt(editFormData.product_quantity),
        product_status: editFormData.product_status
      };
      const response = await axios.put(
        `${baseUrl}/reptitist/shop/my-products/${selectedProduct._id}`,
        submitData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      if (response.status === 200) {
        toast.success('Cập nhật sản phẩm thành công!');
        await fetchMyProducts(); // Refresh products
        await fetchMyStats();
        setIsEditMode(false);
        setShowProductDetailModal(false);
      }
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật sản phẩm');
    } finally {
      setEditLoading(false);
    }
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
      const token = localStorage.getItem('access_token');
      if (!token) {
        toast.error('Phiên đăng nhập đã hết hạn');
        navigate('/Login');
        return;
      }
      const response = await axios.delete(
        `${baseUrl}/reptitist/shop/my-products/${selectedProduct._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 200) {
        toast.success('Xóa sản phẩm thành công!');
        await fetchMyProducts();
        await fetchMyStats();
        setShowDeleteModal(false);
        setSelectedProduct(null);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi xóa sản phẩm');
    }
  };

  // Update product status
  const updateProductStatus = async (productId, newStatus) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        toast.error('Phiên đăng nhập đã hết hạn');
        navigate('/Login');
        return;
      }
      const response = await axios.put(
        `${baseUrl}/reptitist/shop/my-products/${productId}`,
        { product_status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 200) {
        toast.success('Cập nhật trạng thái thành công!');
        await fetchMyProducts();
        await fetchMyStats();
      }
    } catch (error) {
      console.error('Error updating product status:', error);
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật trạng thái sản phẩm');
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "N/A";
    }
  };

  // Format number for display
  const formatNumber = (num) => {
    if (!num) return '';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (typeof amount !== "number") return "0 VNĐ";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Format inventory value with M, B, T
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
    // Lấy 1-2 chữ số thập phân nếu cần
    const formatted = value % 1 === 0 ? value.toFixed(0) : value.toFixed(2).replace(/\.0+$/, '');
    return `${formatted}${suffix}₫`;
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "available":
        return "pm-badge-available";
      case "reported":
        return "pm-badge-pending";
      case "not_available":
        return "pm-badge-not-available";
      default:
        return "pm-badge-default";
    }
  };

  // Get category name
  const getCategoryName = (category) => {
    if (category && typeof category === "object") {
      return category.product_category_name || "N/A";
    }
    const cat = categories.find((c) => c._id === category);
    return cat ? cat.product_category_name : "N/A";
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm("");
    setFilterStatus("all");
    setFilterDate("all");
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
          <span key="start-dots" className="pm-pagination-dots">
            ...
          </span>
        );
      }
    }

    // Visible pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`pm-pagination-btn ${currentPage === i ? "active" : ""}`}
        >
          {i}
        </button>
      );
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="end-dots" className="pm-pagination-dots">
            ...
          </span>
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
                <i className="fas fa-store"></i>
                Quản lý sản phẩm của tôi
              </h1>
              <p>Quản lý tất cả sản phẩm trong cửa hàng của bạn</p>
              <div className="pm-header-breadcrumb">
                <Link to="/">Trang chủ</Link>
                <i className="fas fa-chevron-right"></i>
                <span>Quản lý sản phẩm</span>
              </div>
            </div>
            <div className="pm-header-actions">
              <Link
                to="/shop/products/create"
                className="pm-btn pm-btn-primary"
              >
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
                <span className="pm-stat-number">{stats.totalProducts}</span>
                <span className="pm-stat-label">Tổng sản phẩm</span>
              </div>
            </div>

            <div className="pm-stat-card pm-stat-available">
              <div className="pm-stat-icon">
                <i className="fas fa-check-circle"></i>
              </div>
              <div className="pm-stat-content">
                <span className="pm-stat-number">
                  {stats.availableProducts}
                </span>
                <span className="pm-stat-label">Đang bán</span>
                <span className="pm-stat-percentage">
                  {stats.totalProducts && stats.availableProducts >= 0
                    ? `${Math.round((stats.availableProducts / stats.totalProducts) * 100)}%`
                    : ''}
                </span>
              </div>
            </div>

            <div className="pm-stat-card pm-stat-pending">
              <div className="pm-stat-icon">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <div className="pm-stat-content">
                <span className="pm-stat-number">{stats.reportedProducts}</span>
                <span className="pm-stat-label">Bị báo cáo</span>
                <span className="pm-stat-percentage">
                  {stats.totalProducts && stats.reportedProducts >= 0
                    ? `${Math.round((stats.reportedProducts / stats.totalProducts) * 100)}%`
                    : ''}
                </span>
              </div>
            </div>

            <div className="pm-stat-card pm-stat-not-available">
              <div className="pm-stat-icon">
                <i className="fas fa-ban"></i>
              </div>
              <div className="pm-stat-content">
                <span className="pm-stat-number">
                  {stats.notAvailableProducts}
                </span>
                <span className="pm-stat-label">Ngừng bán</span>
              </div>
            </div>

            <div className="pm-stat-card pm-stat-out-of-stock">
              <div className="pm-stat-icon">
                <i className="fas fa-times-circle"></i>
              </div>
              <div className="pm-stat-content">
                <span className="pm-stat-number">{stats.outOfStock}</span>
                <span className="pm-stat-label">Hết hàng</span>
              </div>
            </div>

            <div className="pm-stat-card pm-stat-categories">
              <div className="pm-stat-icon">
                <i className="fas fa-wallet"></i>
              </div>
              <div className="pm-stat-content">
                <span className="pm-stat-number">
                  {typeof stats.inventoryValue === 'number' && !isNaN(stats.inventoryValue)
                    ? formatInventoryValue(stats.inventoryValue)
                    : formatInventoryValue(0)}
                </span>
                <span className="pm-stat-label">Giá trị kho hàng</span>
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
                {categories.map((category) => (
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
                <option value="reported">Bị báo cáo</option>
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
          {(searchTerm ||
            filterCategory !== "all" ||
            filterStatus !== "all" ||
            filterDate !== "all") && (
            <div className="pm-filter-summary">
              <div className="pm-filter-results">
                <span>
                  Hiển thị {filteredProducts.length} / {products.length} sản
                  phẩm
                </span>
              </div>
              <div className="pm-filter-tags">
                {searchTerm && (
                  <span className="pm-filter-tag">
                    <i className="fas fa-search"></i>"{searchTerm}"
                    <button onClick={() => setSearchTerm("")}>×</button>
                  </span>
                )}
                {filterCategory !== "all" && (
                  <span className="pm-filter-tag">
                    <i className="fas fa-tags"></i>
                    {getCategoryName(filterCategory)}
                    <button onClick={() => setFilterCategory("all")}>×</button>
                  </span>
                )}
                {filterStatus !== "all" && (
                  <span className="pm-filter-tag">
                    <i className="fas fa-toggle-on"></i>
                    {filterStatus === "available"
                      ? "Đang bán"
                      : filterStatus === "reported"
                      ? "Bị báo cáo"
                      : "Ngừng bán"}
                    <button onClick={() => setFilterStatus("all")}>×</button>
                  </span>
                )}
                {filterDate !== "all" && (
                  <span className="pm-filter-tag">
                    <i className="fas fa-calendar"></i>
                    {filterDate}
                    <button onClick={() => setFilterDate("all")}>×</button>
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
                  ? "Bạn chưa có sản phẩm nào"
                  : "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"}
              </p>
              {filteredProducts.length === 0 && products.length > 0 ? (
                <button
                  onClick={resetFilters}
                  className="pm-btn pm-btn-primary"
                >
                  <i className="fas fa-refresh"></i>
                  Đặt lại bộ lọc
                </button>
              ) : (
                <Link
                  to="/shop/products/create"
                  className="pm-btn pm-btn-primary"
                >
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
                  Sản phẩm của tôi ({filteredProducts.length})
                </h3>
                <div className="pm-table-actions">
                  <button
                    onClick={() => fetchMyProducts()}
                    className="pm-btn pm-btn-secondary"
                    title="Làm mới dữ liệu"
                    disabled={loading}
                  >
                    <i
                      className={`fas fa-sync-alt ${loading ? "fa-spin" : ""}`}
                    ></i>
                  </button>
                </div>
              </div>

              <div className="pm-table-container">
                <table className="pm-products-table">
                  <thead>
                    <tr>
                      <th
                        onClick={() => handleSort("product_name")}
                        className="pm-sortable"
                      >
                        <span>Thông tin sản phẩm</span>
                        {sortField === "product_name" && (
                          <i
                            className={`fas fa-chevron-${
                              sortDirection === "asc" ? "up" : "down"
                            }`}
                          ></i>
                        )}
                      </th>
                      <th>Danh mục</th>
                      <th
                        onClick={() => handleSort("product_price")}
                        className="pm-sortable"
                      >
                        <span>Giá</span>
                        {sortField === "product_price" && (
                          <i
                            className={`fas fa-chevron-${
                              sortDirection === "asc" ? "up" : "down"
                            }`}
                          ></i>
                        )}
                      </th>
                      <th>Số lượng</th>
                      <th>Trạng thái</th>
                      <th
                        onClick={() => handleSort("createdAt")}
                        className="pm-sortable"
                      >
                        <span>Ngày tạo</span>
                        {sortField === "createdAt" && (
                          <i
                            className={`fas fa-chevron-${
                              sortDirection === "asc" ? "up" : "down"
                            }`}
                          ></i>
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
                              src={
                                product.product_imageurl ||
                                "/default-product.png"
                              }
                              alt={product.product_name}
                              className="pm-product-image"
                              onError={(e) => {
                                e.target.src = "/default-product.png";
                              }}
                            />
                            <div className="pm-product-details">
                              <h4
                                className="pm-product-name"
                                title={product.product_name}
                              >
                                {product.product_name}
                              </h4>
                              <p className="pm-product-id">ID: {product._id}</p>
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
                            <span
                              className={`pm-quantity-value ${
                                product.product_quantity === 0
                                  ? "pm-out-of-stock"
                                  : ""
                              }`}
                            >
                              {product.product_quantity || 0}
                            </span>
                            {product.product_quantity === 0 && (
                              <span className="pm-out-of-stock-label">
                                Hết hàng
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="pm-status">
                          <div className="pm-status-container">
                            <span
                              className={`pm-status-badge ${getStatusBadgeColor(
                                product.product_status
                              )}`}
                            >
                              {product.product_status === "available"
                                ? "Đang bán"
                                : product.product_status === "reported"
                                ? "Bị báo cáo"
                                : product.product_status === "not_available"
                                ? "Ngừng bán"
                                : "N/A"}
                            </span>
                            {/* Đã xóa dropdown thay đổi trạng thái khỏi bảng */}
                          </div>
                        </td>

                        <td className="pm-date">
                          <div className="pm-date-info">
                            <span className="pm-date-value">
                              {formatDate(product.createdAt)}
                            </span>
                            {product.updatedAt &&
                              product.updatedAt !== product.createdAt && (
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

                            <div
                              onMouseDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('Edit button clicked for product:', product._id);
                                handleEditProduct(product);
                              }}
                              className="pm-btn pm-btn-icon pm-btn-edit"
                              title="Chỉnh sửa"
                              style={{ cursor: 'pointer', userSelect: 'none' }}
                              role="button"
                              tabIndex={0}
                            >
                              <i className="fas fa-edit"></i>
                            </div>

                            <button
                              onClick={() => handleDeleteProduct(product)}
                              className="pm-btn pm-btn-icon pm-btn-delete"
                              title="Xóa sản phẩm"
                              disabled={product.product_status === "reported"}
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
                    Hiển thị {indexOfFirstItem + 1} -{" "}
                    {Math.min(indexOfLastItem, filteredProducts.length)} của{" "}
                    {filteredProducts.length} sản phẩm
                  </div>

                  <div className="pm-pagination-controls">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
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
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
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
          <div
            className="pm-modal-overlay"
            onClick={() => setShowDeleteModal(false)}
          >
            <div
              className="pm-modal pm-delete-modal"
              onClick={(e) => e.stopPropagation()}
            >
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
                      src={
                        selectedProduct.product_imageurl ||
                        "/default-product.png"
                      }
                      alt={selectedProduct.product_name}
                      className="pm-preview-image"
                    />
                    <div className="pm-preview-info">
                      <h4>{selectedProduct.product_name}</h4>
                      <p>ID: {selectedProduct._id}</p>
                      <p>
                        Giá: {formatCurrency(selectedProduct.product_price)}
                      </p>
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
          <div
            className="pm-modal-overlay"
            onClick={() => {
              setShowProductDetailModal(false);
              setIsEditMode(false);
            }}
          >
            <div
              className="pm-modal pm-detail-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="pm-modal-header">
                <h3>
                  <i className={`fas ${isEditMode ? 'fa-edit' : 'fa-info-circle'}`}></i>
                  {isEditMode ? 'Chỉnh sửa sản phẩm' : 'Chi tiết sản phẩm'}
                </h3>
                <button
                  onClick={() => {
                    setShowProductDetailModal(false);
                    setIsEditMode(false);
                  }}
                  className="pm-modal-close"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <div className="pm-modal-body pm-detail-body">
                {isEditMode ? (
                  // Edit Form
                  <form onSubmit={handleEditSubmit} className="pm-edit-form">
                    <div className="pm-edit-grid">
                      <div className="pm-edit-image">
                        <img
                          src={
                            editFormData.product_imageurl ||
                            selectedProduct.product_imageurl ||
                            "/default-product.png"
                          }
                          alt={editFormData.product_name}
                          className="pm-edit-main-image"
                        />
                      </div>

                      <div className="pm-edit-fields">
                        <div className="pm-edit-field">
                          <label className="pm-edit-label">
                            <i className="fas fa-tag"></i>
                            Tên sản phẩm *
                          </label>
                          <input
                            type="text"
                            name="product_name"
                            value={editFormData.product_name}
                            onChange={handleEditFormChange}
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
                            Mô tả
                          </label>
                          <textarea
                            name="product_description"
                            value={editFormData.product_description}
                            onChange={handleEditFormChange}
                            className="pm-edit-textarea"
                            placeholder="Nhập mô tả sản phẩm"
                            rows="3"
                          />
                        </div>

                        <div className="pm-edit-row">
                          <div className="pm-edit-field">
                            <label className="pm-edit-label">
                              <i className="fas fa-dollar-sign"></i>
                              Giá bán (VNĐ) *
                            </label>
                            <input
                              type="text"
                              name="product_price"
                              value={editFormData.product_price ? formatNumber(editFormData.product_price) : ''}
                              onChange={handleEditFormChange}
                              className={`pm-edit-input ${editErrors.product_price ? 'pm-error' : ''}`}
                              placeholder="150000"
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
                              name="product_quantity"
                              value={editFormData.product_quantity}
                              onChange={handleEditFormChange}
                              className={`pm-edit-input ${editErrors.product_quantity ? 'pm-error' : ''}`}
                              placeholder="10"
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

                        <div className="pm-edit-field">
                          <label className="pm-edit-label">
                            <i className="fas fa-tags"></i>
                            Danh mục *
                          </label>
                          <select
                            name="product_category_id"
                            value={editFormData.product_category_id}
                            onChange={handleEditFormChange}
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
                            <i className="fas fa-image"></i>
                            URL hình ảnh
                          </label>
                          <input
                            type="url"
                            name="product_imageurl"
                            value={editFormData.product_imageurl}
                            onChange={handleEditFormChange}
                            className="pm-edit-input"
                            placeholder="https://example.com/image.jpg"
                          />
                        </div>
                        <div className="pm-edit-field">
                          <label className="pm-edit-label">
                            <i className="fas fa-toggle-on"></i>
                            Trạng thái sản phẩm
                          </label>
                          <select
                            name="product_status"
                            value={editFormData.product_status}
                            onChange={handleEditFormChange}
                            className={`pm-edit-select ${editErrors.product_status ? 'pm-error' : ''}`}
                          >
                            <option value="available">Đang bán</option>
                            <option value="not_available">Ngừng bán</option>
                          </select>
                          {editErrors.product_status && (
                            <div className="pm-error-message">
                              <i className="fas fa-exclamation-circle"></i>
                              {editErrors.product_status}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </form>
                ) : (
                  // View Mode
                  <div className="pm-detail-grid">
                    <div className="pm-detail-image">
                      <img
                        src={
                          selectedProduct.product_imageurl ||
                          "/default-product.png"
                        }
                        alt={selectedProduct.product_name}
                        className="pm-detail-main-image"
                      />
                    </div>

                    <div className="pm-detail-info">
                      <h4 className="pm-detail-title">
                        {selectedProduct.product_name}
                      </h4>

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
                          <span
                            className={
                              selectedProduct.product_quantity === 0
                                ? "pm-out-of-stock"
                                : ""
                            }
                          >
                            {selectedProduct.product_quantity || 0}
                            {selectedProduct.product_quantity === 0 &&
                              " (Hết hàng)"}
                          </span>
                        </div>

                        <div className="pm-detail-field">
                          <label>Trạng thái:</label>
                          <span
                            className={`pm-status-badge ${getStatusBadgeColor(
                              selectedProduct.product_status
                            )}`}
                          >
                            {selectedProduct.product_status === "available"
                              ? "Đang bán"
                              : selectedProduct.product_status === "reported"
                              ? "Bị báo cáo"
                              : selectedProduct.product_status === "not_available"
                              ? "Ngừng bán"
                              : "N/A"}
                          </span>
                        </div>

                        <div className="pm-detail-field">
                          <label>Ngày tạo:</label>
                          <span>{formatDate(selectedProduct.createdAt)}</span>
                        </div>

                        {selectedProduct.updatedAt &&
                          selectedProduct.updatedAt !==
                            selectedProduct.createdAt && (
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
                )}
              </div>

              <div className="pm-modal-footer">
                {isEditMode ? (
                  <>
                    <button
                      onClick={() => setIsEditMode(false)}
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
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleEditProduct(selectedProduct)}
                      className="pm-btn pm-btn-primary"
                    >
                      <i className="fas fa-edit"></i>
                      Chỉnh sửa
                    </button>
                    <button
                      onClick={() => setShowProductDetailModal(false)}
                      className="pm-btn pm-btn-secondary"
                    >
                      <i className="fas fa-times"></i>
                      Đóng
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </>
  );
};

export default ShopProductManagement;