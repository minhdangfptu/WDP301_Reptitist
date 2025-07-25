import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import "../css/UserManagement.css";

import { baseUrl } from "../config";

const AdminShopManagement = () => {
  const { user, hasRole } = useAuth();
  const navigate = useNavigate();

  // State management
  const [shops, setShops] = useState([]);
  const [filteredShops, setFilteredShops] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDate, setFilterDate] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState("created_at");
  const [sortDirection, setSortDirection] = useState("desc");
  const [activeTab, setActiveTab] = useState("shops"); // 'shops' or 'reports'
  const [searchReportProduct, setSearchReportProduct] = useState("");
  const [hiddenProducts, setHiddenProducts] = useState([]);
  const [approvedReports, setApprovedReports] = useState([]);
  const [searchHiddenProduct, setSearchHiddenProduct] = useState("");
  const [allProducts, setAllProducts] = useState([]);
  const [searchAllProduct, setSearchAllProduct] = useState("");
  const [hideReason, setHideReason] = useState("");
  // Thêm state cho modal xóa sản phẩm
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");
  const [deletingProductId, setDeletingProductId] = useState(null);

  // Modal states
  const [showShopDetailModal, setShowShopDetailModal] = useState(false);
  const [showProductsModal, setShowProductsModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedShop, setSelectedShop] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [shopProducts, setShopProducts] = useState([]);
  const [adminNote, setAdminNote] = useState("");

  // Thêm các state cho modal ẩn sản phẩm
  const [showHideModal, setShowHideModal] = useState(false);
  const [hidingProductId, setHidingProductId] = useState(null);

  // Statistics
  const [stats, setStats] = useState({
    users: {
      total: 0,
      active: 0,
      inactive: 0,
      roles: { admin: 0, shop: 0, customer: 0 },
    },
    products: {
      total: 0,
      available: 0,
      reported: 0,
      notAvailable: 0,
    },
    reports: {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      recent: 0,
    },
  });

  const searchInputRef = useRef(null);

  // Check admin permission
  useEffect(() => {
    if (!hasRole("admin")) {
      toast.error("Bạn không có quyền truy cập trang này");
      navigate("/");
      return;
    }
    initializeData();
  }, [hasRole, navigate]);

  // Initialize data
  const initializeData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchShops(), fetchReports(), fetchStats()]);
    } catch (error) {
      console.error("Error initializing data:", error);
      toast.error("Có lỗi xảy ra khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  // Fetch shops
  const fetchShops = async () => {
    try {
      const token = localStorage.getItem("refresh_token");
      if (!token) {
        toast.error("Phiên đăng nhập đã hết hạn");
        return;
      }

      const response = await axios.get(`${baseUrl}/reptitist/admin/shops`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data?.shops) {
        setShops(response.data.shops);
        setFilteredShops(response.data.shops);
      }
    } catch (error) {
      console.error("Error fetching shops:", error);
      toast.error("Không thể tải danh sách shop");
      setShops([]);
      setFilteredShops([]);
    }
  };

  // Fetch reports
  const fetchReports = async () => {
    try {
      const token = localStorage.getItem("refresh_token");
      if (!token) return;

      const response = await axios.get(`${baseUrl}/reptitist/admin/reports`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data?.reports) {
        setReports(response.data.reports);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
      setReports([]);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("refresh_token");
      if (!token) return;

      const response = await axios.get(`${baseUrl}/reptitist/admin/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  // Fetch shop products
  const fetchShopProducts = async (shopId) => {
    try {
      const token = localStorage.getItem("refresh_token");
      if (!token) return;

      const response = await axios.get(
        `${baseUrl}/reptitist/admin/shops/${shopId}/products`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data?.products) {
        setShopProducts(response.data.products);
      }
    } catch (error) {
      console.error("Error fetching shop products:", error);
      toast.error("Không thể tải sản phẩm của shop");
      setShopProducts([]);
    }
  };

  // Fetch hidden products và approved reports
  const fetchHiddenProductsAndReports = async () => {
    try {
      const token = localStorage.getItem("refresh_token");
      if (!token) return;
      // Lấy sản phẩm bị ẩn
      const productRes = await axios.get(
        `${baseUrl}/reptitist/admin/products?status=not_available`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // Lấy báo cáo đã được duyệt
      const reportRes = await axios.get(
        `${baseUrl}/reptitist/admin/reports?status=approved`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setHiddenProducts(productRes.data?.products || []);
      setApprovedReports(reportRes.data?.reports || []);
    } catch (error) {
      setHiddenProducts([]);
      setApprovedReports([]);
    }
  };

  // Fetch all products
  const fetchAllProducts = async () => {
    try {
      const token = localStorage.getItem("refresh_token");
      if (!token) return;

      const response = await axios.get(`${baseUrl}/reptitist/admin/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAllProducts(response.data?.products || []);
    } catch (error) {
      console.error("Error fetching all products:", error);
      setAllProducts([]);
    }
  };

  // Auto fetch data when switching tab
  useEffect(() => {
    if (activeTab === "hiddenProducts") {
      fetchHiddenProductsAndReports();
    } else if (activeTab === "allProducts") {
      fetchAllProducts();
    }
    // eslint-disable-next-line
  }, [activeTab]);

  useEffect(() => {
    fetchHiddenProductsAndReports();
    fetchAllProducts();
  }, []);

  // Handle delete product by admin
  const handleDeleteProduct = async (productId, reason) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
      return;
    }
    try {
      const token = localStorage.getItem("refresh_token");
      if (!token) return;
      const response = await axios.delete(
        `${baseUrl}/reptitist/admin/products/${productId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          data: {
            deleteReason: reason || undefined,
          },
        }
      );
      if (response.status === 200) {
        const message = response.data.emailSent
          ? "Xóa sản phẩm thành công! Email thông báo đã được gửi đến shop owner."
          : "Xóa sản phẩm thành công!";
        toast.success(message);
        // Refresh tất cả dữ liệu liên quan
        await Promise.all([
          fetchHiddenProductsAndReports(),
          fetchAllProducts(),
          fetchStats(),
        ]);
        // Refresh shop products nếu đang xem shop detail
        if (selectedShop) {
          await fetchShopProducts(selectedShop._id);
        }
        // Cập nhật state ngay lập tức cho UI
        if (activeTab === "hiddenProducts") {
          setHiddenProducts((prev) => prev.filter((p) => p._id !== productId));
        } else if (activeTab === "allProducts") {
          setAllProducts((prev) => prev.filter((p) => p._id !== productId));
        }
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Có lỗi xảy ra khi xóa sản phẩm");
    }
  };

  // Handle report action
  const handleReportAction = async (reportId, action, note = "") => {
    try {
      const token = localStorage.getItem("refresh_token");
      if (!token) return;

      const response = await axios.post(
        `${baseUrl}/reptitist/admin/reports/${reportId}/handle`,
        {
          action, // 'approve' or 'reject'
          adminNote: note,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        const message =
          action === "approve"
            ? `Chấp nhận báo cáo thành công${
                response.data.emailSent ? " và đã gửi email thông báo" : ""
              }`
            : "Từ chối báo cáo thành công";
        toast.success(message);
        await fetchReports();
        await fetchStats();
        setShowReportModal(false);
        setSelectedReport(null);
        setAdminNote("");
      }
    } catch (error) {
      console.error("Error handling report:", error);
      toast.error("Có lỗi xảy ra khi xử lý báo cáo");
    }
  };

  // Handle toggle shop status
  const toggleShopStatus = async (shopData) => {
    try {
      const token = localStorage.getItem("refresh_token");
      if (!token) return;

      const newStatus = !shopData.isActive;
      const response = await axios.patch(
        `${baseUrl}/reptitist/admin/users/${shopData._id}/status`,
        { isActive: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        toast.success(
          `${newStatus ? "Kích hoạt" : "Vô hiệu hóa"} shop thành công`
        );
        setShops((prevShops) =>
          prevShops.map((shop) =>
            shop._id === shopData._id ? { ...shop, isActive: newStatus } : shop
          )
        );
        setFilteredShops((prevShops) =>
          prevShops.map((shop) =>
            shop._id === shopData._id ? { ...shop, isActive: newStatus } : shop
          )
        );
        if (selectedShop && selectedShop._id === shopData._id) {
          setSelectedShop((prev) => ({ ...prev, isActive: newStatus }));
        }
        await fetchStats();
      }
    } catch (error) {
      console.error("Error toggling shop status:", error);
      toast.error("Có lỗi xảy ra khi thay đổi trạng thái shop");
    }
  };

  // Filter and search logic
  useEffect(() => {
    let filtered = [...shops];

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (shop) =>
          shop.username.toLowerCase().includes(searchLower) ||
          shop.email.toLowerCase().includes(searchLower) ||
          (shop.fullname && shop.fullname.toLowerCase().includes(searchLower))
      );
    }

    // Status filter
    if (filterStatus !== "all") {
      const isActive = filterStatus === "active";
      filtered = filtered.filter((shop) => shop.isActive === isActive);
    }

    // Date filter
    if (filterDate !== "all") {
      const now = new Date();
      const startDate = new Date();

      switch (filterDate) {
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
          break;
      }

      if (filterDate !== "all") {
        filtered = filtered.filter((shop) => {
          const shopDate = new Date(shop.created_at);
          return shopDate >= startDate;
        });
      }
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === "created_at") {
        aValue = new Date(a.created_at);
        bValue = new Date(b.created_at);
      } else if (sortField === "productCount") {
        aValue = a.productCount || 0;
        bValue = b.productCount || 0;
      }

      if (sortDirection === "asc") {
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
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (typeof amount !== "number") return "0 VNĐ";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "available":
        return "um-badge-customer";
      case "reported":
        return "um-badge-admin";
      case "not_available":
        return "um-badge-default";
      default:
        return "um-badge-default";
    }
  };

  // Get report status badge color
  const getReportStatusBadgeColor = (status) => {
    switch (status) {
      case "pending":
        return "um-badge-admin";
      case "approved":
        return "um-badge-customer";
      case "rejected":
        return "um-badge-default";
      default:
        return "um-badge-default";
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentShops = filteredShops.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredShops.length / itemsPerPage);

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

  // Filtered reports by product name
  const filteredReports = reports.filter((report) => {
    if (!searchReportProduct) return true;
    const productName = report.product_id?.product_name || "";
    const productId = report.product_id?._id || "";
    return (
      productName.toLowerCase().includes(searchReportProduct.toLowerCase()) ||
      productId.toLowerCase().includes(searchReportProduct.toLowerCase())
    );
  });

  // Lọc báo cáo chờ xử lý
  const pendingReports = reports.filter(
    (report) => report.status === "pending"
  );

  // Thêm hàm chuyển trạng thái sản phẩm
  const handleToggleProductStatus = async (
    productId,
    currentStatus,
    reason
  ) => {
    try {
      const token = localStorage.getItem("refresh_token");
      if (!token) return;
      let newStatus =
        currentStatus === "not_available" ? "available" : "not_available";
      let hideReason = reason;
      if (newStatus === "not_available" && !hideReason) {
        toast.error("Vui lòng nhập lý do ẩn sản phẩm!");
        return;
      }
      const response = await axios.put(
        `${baseUrl}/reptitist/admin/products/${productId}/status`,
        { product_status: newStatus, hideReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (newStatus === "available") {
        if (response.data.emailSent) {
          toast.success(
            "Cập nhật trạng thái sản phẩm thành công! Email thông báo đã được gửi đến shop owner."
          );
        } else {
          toast.success("Cập nhật trạng thái sản phẩm thành công!");
        }
      } else {
        if (response.data.emailSent) {
          toast.success(
            "Cập nhật trạng thái sản phẩm thành công! Email thông báo đã được gửi đến shop owner."
          );
        } else {
          toast.success("Cập nhật trạng thái sản phẩm thành công!");
        }
      }
      // Refresh tất cả dữ liệu liên quan
      await Promise.all([
        fetchHiddenProductsAndReports(),
        fetchAllProducts(),
        fetchStats(),
      ]);
      // Cập nhật state ngay lập tức cho UI
      if (activeTab === "hiddenProducts") {
        setHiddenProducts((prev) => {
          if (newStatus === "available") {
            return prev.filter((p) => p._id !== productId);
          } else {
            const product = allProducts.find((p) => p._id === productId);
            return product ? [...prev, product] : prev;
          }
        });
      } else if (activeTab === "allProducts") {
        setAllProducts((prev) =>
          prev.map((p) =>
            p._id === productId ? { ...p, product_status: newStatus } : p
          )
        );
      }
    } catch (error) {
      console.error("Error toggling product status:", error);
      toast.error("Không thể cập nhật trạng thái sản phẩm");
    }
  };

  // Lọc sản phẩm bị ẩn theo tên
  const filteredHiddenProducts = hiddenProducts.filter((product) => {
    if (!searchHiddenProduct) return true;
    const name = (product.product_name || "").toLowerCase();
    const id = (product._id || "").toLowerCase();
    return (
      name.includes(searchHiddenProduct.toLowerCase()) ||
      id.includes(searchHiddenProduct.toLowerCase())
    );
  });

  // Lọc tất cả sản phẩm theo tên
  const filteredAllProducts = allProducts.filter((product) => {
    if (!searchAllProduct) return true;
    const name = (product.product_name || "").toLowerCase();
    const id = (product._id || "").toLowerCase();
    return (
      name.includes(searchAllProduct.toLowerCase()) ||
      id.includes(searchAllProduct.toLowerCase())
    );
  });

  // Thêm hàm yêu cầu nhập lý do khi ẩn sản phẩm
  const promptHideReason = async () => {
    let reason = "";
    while (!reason) {
      reason = window.prompt("Nhập lý do ẩn sản phẩm (bắt buộc):");
      if (reason === null) return null; // Bấm Cancel
      if (!reason) toast.error("Vui lòng nhập lý do ẩn sản phẩm!");
    }
    return reason;
  };

  // Check admin access
  if (!hasRole("admin")) {
    return (
      <>
        <Header />
        <div className="um-user-list-container">
          <div className="um-no-access">
            <i className="fas fa-exclamation-triangle um-warning-icon"></i>
            <h2>Không có quyền truy cập</h2>
            <p>
              Bạn không có quyền xem trang này. Chỉ có Admin mới có thể truy
              cập.
            </p>
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
                <span className="um-stat-number">{shops.length}</span>
                <span className="um-stat-label">Tổng Shop</span>
              </div>
            </div>

            <div className="um-stat-card um-stat-total">
              <div className="um-stat-icon">
                <i className="fas fa-box"></i>
              </div>
              <div className="um-stat-content">
                <span className="um-stat-number">{allProducts.length}</span>
                <span className="um-stat-label">Tổng sản phẩm</span>
              </div>
            </div>

            <div className="um-stat-card um-stat-active">
              <div className="um-stat-icon">
                <i className="fas fa-check-circle"></i>
              </div>
              <div className="um-stat-content">
                <span className="um-stat-number">
                  {
                    allProducts.filter((p) => p.product_status === "available")
                      .length
                  }
                </span>
                <span className="um-stat-label">Đang bán</span>
              </div>
            </div>

            <div className="um-stat-card um-stat-inactive">
              <div className="um-stat-icon">
                <i className="fas fa-flag"></i>
              </div>
              <div className="um-stat-content">
                <span className="um-stat-number">{pendingReports.length}</span>
                <span className="um-stat-label">Báo cáo chờ xử lý</span>
              </div>
            </div>

            <div className="um-stat-card um-stat-customer">
              <div className="um-stat-icon">
                <i className="fas fa-clock"></i>
              </div>
              <div className="um-stat-content">
                <span className="um-stat-number">
                  {
                    reports.filter((r) => {
                      const sevenDaysAgo = new Date();
                      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                      return new Date(r.createdAt) >= sevenDaysAgo;
                    }).length
                  }
                </span>
                <span className="um-stat-label">Báo cáo tuần này</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{maxWidth: "1200px", margin: "0 auto", marginBottom: "30px"}}>
        <div
          className="um-filters-section"
          style={{ marginBottom: "10px", paddingBottom: "10px" }}
        >
          <div
            className="um-filters-row"
            style={{ justifyContent: "flex-start", gap: "20px" }}
          >
            <button
              className={`um-btn ${
                activeTab === "shops" ? "um-btn-primary" : "um-btn-secondary"
              }`}
              onClick={() => setActiveTab("shops")}
              style={{
                minWidth: "200px",
                borderRadius: "25px",
                fontWeight: "600",
              }}
            >
              <i className="fas fa-store"></i>
              Quản lý Shop ({filteredShops.length})
            </button>
            <button
              className={`um-btn ${
                activeTab === "reports" ? "um-btn-primary" : "um-btn-secondary"
              }`}
              onClick={() => setActiveTab("reports")}
              style={{
                minWidth: "200px",
                borderRadius: "25px",
                fontWeight: "600",
              }}
            >
              <i className="fas fa-flag"></i>
              Báo cáo chờ xử lý ({pendingReports.length})
            </button>
            <button
              className={`um-btn ${
                activeTab === "hiddenProducts"
                  ? "um-btn-primary"
                  : "um-btn-secondary"
              }`}
              onClick={() => setActiveTab("hiddenProducts")}
              style={{
                minWidth: "200px",
                borderRadius: "25px",
                fontWeight: "600",
              }}
            >
              <i className="fas fa-eye-slash"></i>
              Sản phẩm đã bị ẩn ({hiddenProducts.length})
            </button>
            <button
              className={`um-btn ${
                activeTab === "allProducts"
                  ? "um-btn-primary"
                  : "um-btn-secondary"
              }`}
              onClick={() => setActiveTab("allProducts")}
              style={{
                minWidth: "200px",
                borderRadius: "25px",
                fontWeight: "600",
              }}
            >
              <i className="fas fa-box"></i>
              Tất cả sản phẩm ({allProducts.length})
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "shops" ? (
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
              {(searchTerm ||
                filterStatus !== "all" ||
                filterDate !== "all") && (
                <div className="um-filter-summary">
                  <div className="um-filter-results">
                    <span>
                      Hiển thị {filteredShops.length} / {shops.length} shop
                    </span>
                  </div>
                  <div className="um-filter-tags">
                    {searchTerm && (
                      <span className="um-filter-tag">
                        <i className="fas fa-search"></i>"{searchTerm}"
                        <button onClick={() => setSearchTerm("")}>×</button>
                      </span>
                    )}
                    {filterStatus !== "all" && (
                      <span className="um-filter-tag">
                        <i className="fas fa-toggle-on"></i>
                        {filterStatus === "active" ? "Hoạt động" : "Đã khóa"}
                        <button onClick={() => setFilterStatus("all")}>
                          ×
                        </button>
                      </span>
                    )}
                    {filterDate !== "all" && (
                      <span className="um-filter-tag">
                        <i className="fas fa-calendar"></i>
                        {filterDate}
                        <button onClick={() => setFilterDate("all")}>×</button>
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
                        {currentShops.map((shop) => (
                          <tr key={shop._id} className="um-table-row">
                            <td>
                              <div className="um-user-info">
                                <div className="um-user-avatar-container">
                                  <img
                                    src={
                                      shop.user_imageurl ||
                                      "/default-avatar.png"
                                    }
                                    alt={shop.username}
                                    className="um-user-avatar"
                                    onError={(e) => {
                                      e.target.src = "/default-avatar.png";
                                    }}
                                  />
                                  <div
                                    className={`um-status-dot ${
                                      shop.isActive ? "active" : "inactive"
                                    }`}
                                  ></div>
                                </div>
                                <div className="um-user-details">
                                  <span className="um-username">
                                    {shop.username}
                                  </span>
                                  {shop.fullname && (
                                    <small className="um-fullname">
                                      {shop.fullname}
                                    </small>
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
                                <span className="um-balance">
                                  {shop.productCount || 0}
                                </span>
                                <small className="um-account-type">
                                  <i className="fas fa-box"></i>
                                  sản phẩm
                                </small>
                              </div>
                            </td>

                            <td>
                              <div className="um-balance-info">
                                <span
                                  className={`um-balance ${
                                    shop.reportedCount > 0 ? "text-danger" : ""
                                  }`}
                                >
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
                                className={`um-status-btn ${
                                  shop.isActive
                                    ? "um-status-active"
                                    : "um-status-inactive"
                                }`}
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
                        Hiển thị {indexOfFirstItem + 1} -{" "}
                        {Math.min(indexOfLastItem, filteredShops.length)} của{" "}
                        {filteredShops.length} shop
                      </div>

                      <div className="um-pagination-controls">
                        <button
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(prev - 1, 1))
                          }
                          disabled={currentPage === 1}
                          className="um-pagination-btn um-pagination-prev"
                        >
                          <i className="fas fa-chevron-left"></i>
                          Trước
                        </button>

                        {Array.from(
                          { length: totalPages },
                          (_, i) => i + 1
                        ).map((page) => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`um-pagination-btn ${
                              currentPage === page ? "active" : ""
                            }`}
                          >
                            {page}
                          </button>
                        ))}

                        <button
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(prev + 1, totalPages)
                            )
                          }
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
        ) : activeTab === "reports" ? (
          // Reports Management Tab
          <div className="um-table-section">
            <div className="um-table-header">
              <h3>
                <i className="fas fa-flag"></i>
                Báo cáo sản phẩm ({pendingReports.length})
              </h3>
            </div>

            {/* Search by product name */}
            <div
              className="um-filters-section"
              style={{ marginBottom: "10px" }}
            >
              <div className="um-search-box">
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên hoặc ID sản phẩm..."
                  value={searchReportProduct}
                  onChange={(e) => setSearchReportProduct(e.target.value)}
                  className="um-search-input"
                />
                <i className="fas fa-search um-search-icon"></i>
              </div>
            </div>

            {pendingReports.length === 0 ? (
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
                    {pendingReports
                      .filter((report) => {
                        if (!searchReportProduct) return true;
                        const productName =
                          report.product_id?.product_name || "";
                        const productId = report.product_id?._id || "";
                        return (
                          productName
                            .toLowerCase()
                            .includes(searchReportProduct.toLowerCase()) ||
                          productId
                            .toLowerCase()
                            .includes(searchReportProduct.toLowerCase())
                        );
                      })
                      .map((report) => (
                        <tr key={report._id} className="um-table-row">
                          <td>
                            <div className="um-user-info">
                              <div className="um-user-avatar-container">
                                <img
                                  src={
                                    report.product_id?.product_imageurl?.[0] ||
                                    "/images/default-product.png"
                                  }
                                  alt={report.product_id?.product_name}
                                  className="um-user-avatar"
                                  onError={(e) => {
                                    e.target.src =
                                      "/images/default-product.png";
                                  }}
                                />
                              </div>
                              <div className="um-user-details">
                                <span className="um-username">
                                  {report.product_id?.product_name ||
                                    "Sản phẩm đã xóa"}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td>
                            <div className="um-contact-info">
                              <div className="um-email">
                                <i className="fas fa-user"></i>
                                {report.reporter_id?.username || "N/A"}
                              </div>
                              <div className="um-phone">
                                <i className="fas fa-envelope"></i>
                                {report.reporter_id?.email || "N/A"}
                              </div>
                            </div>
                          </td>

                          <td>
                            <div className="um-contact-info">
                              <div className="um-email">
                                <i className="fas fa-store"></i>
                                {report.shop_id?.username || "N/A"}
                              </div>
                              <div className="um-phone">
                                <i className="fas fa-envelope"></i>
                                {report.shop_id?.email || "N/A"}
                              </div>
                            </div>
                          </td>

                          <td>
                            <div className="um-balance-info">
                              <span className="um-balance">
                                {report.reason.length > 50
                                  ? `${report.reason.substring(0, 50)}...`
                                  : report.reason}
                              </span>
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
                            <span
                              className={`um-role-badge ${getReportStatusBadgeColor(
                                report.status
                              )}`}
                            >
                              {report.status === "pending"
                                ? "Chờ xử lý"
                                : report.status === "approved"
                                ? "Đã chấp nhận"
                                : report.status === "rejected"
                                ? "Đã từ chối"
                                : "N/A"}
                            </span>
                          </td>

                          <td>
                            <div className="um-action-buttons">
                              <button
                                onClick={() => {
                                  setSelectedReport(report);
                                  setAdminNote("");
                                  setShowReportModal(true);
                                }}
                                className="um-btn-action um-btn-view"
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
            )}
          </div>
        ) : activeTab === "allProducts" ? (
          // All Products Tab
          <div className="um-table-section">
            <div className="um-table-header">
              <h3>
                <i className="fas fa-box"></i>
                Tất cả sản phẩm ({filteredAllProducts.length})
              </h3>
            </div>
            {/* Search all products */}
            <div
              className="um-filters-section"
              style={{ marginBottom: "10px" }}
            >
              <div className="um-search-box">
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên hoặc ID sản phẩm..."
                  value={searchAllProduct}
                  onChange={(e) => setSearchAllProduct(e.target.value)}
                  className="um-search-input"
                />
                <i className="fas fa-search um-search-icon"></i>
              </div>
            </div>
            {filteredAllProducts.length === 0 ? (
              <div className="um-empty-state">
                <i className="fas fa-box-open um-empty-icon"></i>
                <h3>Không có sản phẩm nào</h3>
                <p>Chưa có sản phẩm nào trong hệ thống</p>
              </div>
            ) : (
              <div className="um-table-container">
                <table className="um-users-table">
                  <thead>
                    <tr>
                      <th>Ảnh</th>
                      <th>Tên sản phẩm</th>
                      <th>Shop</th>
                      <th>Giá</th>
                      <th>Số lượng</th>
                      <th>Ngày tạo</th>
                      <th>Trạng thái</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAllProducts.map((product) => (
                      <tr key={product._id} className="um-table-row">
                        <td>
                          <div className="um-user-avatar-container">
                            <img
                              src={
                                product.product_imageurl?.[0] ||
                                "/images/default-product.png"
                              }
                              alt={product.product_name}
                              className="um-user-avatar"
                              onError={(e) => {
                                e.target.src = "/images/default-product.png";
                              }}
                            />
                          </div>
                        </td>
                        <td>{product.product_name}</td>
                        <td>{product.user_id?.username || "N/A"}</td>
                        <td>
                          <span className="um-balance">
                            {formatCurrency(product.product_price)}
                          </span>
                        </td>
                        <td>
                          <span
                            className={
                              product.product_quantity === 0
                                ? "text-danger"
                                : ""
                            }
                          >
                            {product.product_quantity}
                            {product.product_quantity === 0 && " (Hết hàng)"}
                          </span>
                        </td>
                        <td>{formatDate(product.createdAt)}</td>
                        <td>
                          <span
                            className={`um-role-badge ${getStatusBadgeColor(
                              product.product_status
                            )}`}
                          >
                            {product.product_status === "available"
                              ? "Đang bán"
                              : product.product_status === "reported"
                              ? "Bị báo cáo"
                              : product.product_status === "not_available"
                              ? "Đã bị ẩn"
                              : "N/A"}
                          </span>
                        </td>
                        <td>
                          <div className="um-action-buttons">
                            {/* <button
                              onClick={() => {
                                setDeletingProductId(product._id);
                                setDeleteReason("");
                                setShowDeleteModal(true);
                              }}
                              className="um-btn-action um-btn-delete"
                              title="Xóa sản phẩm"
                            >
                              <i className="fas fa-trash"></i>
                            </button> */}
                            <button
                              className={`um-status-btn ${
                                product.product_status === "not_available"
                                  ? "um-status-inactive"
                                  : "um-status-active"
                              }`}
                              onClick={() => {
                                if (
                                  product.product_status !== "not_available"
                                ) {
                                  setHidingProductId(product._id);
                                  setHideReason("");
                                  setShowHideModal(true);
                                } else {
                                  handleToggleProductStatus(
                                    product._id,
                                    product.product_status
                                  );
                                }
                              }}
                              title={
                                product.product_status === "not_available"
                                  ? "Bỏ ẩn sản phẩm"
                                  : "Ẩn sản phẩm"
                              }
                            >
                              {product.product_status === "not_available" ? (
                                <>
                                  <i></i> Bỏ ẩn
                                </>
                              ) : (
                                <>
                                  <i></i> Ẩn
                                </>
                              )}
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
        ) : (
          // Hidden Products Tab
          <div className="um-table-section">
            <div className="um-table-header">
              <h3>
                <i className="fas fa-eye-slash"></i>
                Sản phẩm đã bị ẩn ({filteredHiddenProducts.length})
              </h3>
            </div>
            {/* Search hidden products */}
            <div
              className="um-filters-section"
              style={{ marginBottom: "10px" }}
            >
              <div className="um-search-box">
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên hoặc ID sản phẩm..."
                  value={searchHiddenProduct}
                  onChange={(e) => setSearchHiddenProduct(e.target.value)}
                  className="um-search-input"
                />
                <i className="fas fa-search um-search-icon"></i>
              </div>
            </div>
            {filteredHiddenProducts.length === 0 ? (
              <div className="um-empty-state">
                <i className="fas fa-eye-slash um-empty-icon"></i>
                <h3>Không có sản phẩm bị ẩn</h3>
                <p>Chưa có sản phẩm nào bị ẩn khỏi hệ thống</p>
              </div>
            ) : (
              <div className="um-table-container">
                <table className="um-users-table">
                  <thead>
                    <tr>
                      <th>Ảnh</th>
                      <th>Tên sản phẩm</th>
                      <th>Shop</th>
                      <th>Ngày tạo</th>
                      <th>Lý do ẩn</th>
                      <th>Trạng thái</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHiddenProducts.map((product) => {
                      // Tìm báo cáo được duyệt gần nhất cho sản phẩm này
                      const relatedReports = approvedReports.filter(
                        (r) => r.product_id?._id === product._id
                      );
                      let reason = "Không có ghi chú";
                      if (relatedReports.length > 0) {
                        relatedReports.sort(
                          (a, b) =>
                            new Date(b.resolved_at || b.createdAt) -
                            new Date(a.resolved_at || a.createdAt)
                        );
                        reason =
                          relatedReports[0].admin_note || "Không có ghi chú";
                      }
                      return (
                        <tr key={product._id} className="um-table-row">
                          <td>
                            <div className="um-user-avatar-container">
                              <img
                                src={
                                  product.product_imageurl?.[0] ||
                                  "/images/default-product.png"
                                }
                                alt={product.product_name}
                                className="um-user-avatar"
                                onError={(e) => {
                                  e.target.src = "/images/default-product.png";
                                }}
                              />
                            </div>
                          </td>
                          <td>{product.product_name}</td>
                          <td>{product.user_id?.username || "N/A"}</td>
                          <td>{formatDate(product.createdAt)}</td>
                          <td>
                            <div className="um-reason-cell" title={reason}>
                              {reason}
                            </div>
                          </td>
                          <td>
                            <span className="um-role-badge um-badge-default">
                              {product.product_status === "not_available"
                                ? "Đã bị ẩn"
                                : "Đang bán"}
                            </span>
                          </td>
                          <td>
                            <button
                              className={`um-status-btn ${
                                product.product_status === "not_available"
                                  ? "um-status-inactive"
                                  : "um-status-active"
                              }`}
                              onClick={() =>
                                handleToggleProductStatus(
                                  product._id,
                                  product.product_status
                                )
                              }
                            >
                              {product.product_status === "not_available" ? (
                                <>
                                  <i></i> Bỏ ẩn
                                </>
                              ) : (
                                <>
                                  <i></i> Ẩn
                                </>
                              )}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Shop Detail Modal */}
        {showShopDetailModal && selectedShop && (
          <div
            className="um-modal-overlay"
            onClick={() => setShowShopDetailModal(false)}
          >
            <div
              className="um-modal-content um-modal-large"
              onClick={(e) => e.stopPropagation()}
            >
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
                        src={
                          selectedShop.user_imageurl ||
                          "/images/default-avatar.png"
                        }
                        alt={selectedShop.username}
                        onError={(e) => {
                          e.target.src = "/images/default-avatar.png";
                        }}
                      />
                    </div>
                    <div className="um-user-basic-info">
                      <h4>{selectedShop.username}</h4>
                      <p className="um-user-email">{selectedShop.email}</p>
                      <span
                        className={`um-role-badge ${
                          selectedShop.isActive
                            ? "um-badge-customer"
                            : "um-badge-admin"
                        }`}
                      >
                        {selectedShop.isActive ? "Đang hoạt động" : "Đã khóa"}
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
                        <label>Tên đầy đủ:</label>
                        <span>{selectedShop.fullname || "N/A"}</span>
                      </div>
                      <div className="um-detail-item">
                        <label>Số điện thoại:</label>
                        <span>{selectedShop.phone_number || "N/A"}</span>
                      </div>
                      <div className="um-detail-item">
                        <label>Địa chỉ:</label>
                        <span>{selectedShop.address || "N/A"}</span>
                      </div>
                      <div className="um-detail-item">
                        <label>Ngày đăng ký:</label>
                        <span>{formatDate(selectedShop.created_at)}</span>
                      </div>
                      <div className="um-detail-item">
                        <label>Trạng thái:</label>
                        <span
                          className={`um-status-indicator ${
                            selectedShop.isActive ? "active" : "inactive"
                          }`}
                        >
                          <i
                            className={`fas ${
                              selectedShop.isActive
                                ? "fa-check-circle"
                                : "fa-ban"
                            }`}
                          ></i>
                          {selectedShop.isActive ? "Đang hoạt động" : "Đã khóa"}
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
                        <span>{selectedShop.wallet.currency || "VND"}</span>
                      </div>
                      <div className="um-wallet-updated">
                        <span className="um-updated-label">
                          Cập nhật lần cuối:
                        </span>
                        <span>
                          {formatDate(selectedShop.wallet.last_updated)}
                        </span>
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
                    className={`um-btn ${
                      selectedShop.isActive
                        ? "um-btn-warning"
                        : "um-btn-success"
                    }`}
                  >
                    <i
                      className={`fas ${
                        selectedShop.isActive ? "fa-ban" : "fa-check"
                      }`}
                    ></i>
                    {selectedShop.isActive ? "Khóa Shop" : "Mở khóa Shop"}
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
          <div
            className="um-modal-overlay"
            onClick={() => setShowProductsModal(false)}
          >
            <div
              className="um-modal-content um-modal-large"
              onClick={(e) => e.stopPropagation()}
            >
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
                        </tr>
                      </thead>
                      <tbody>
                        {shopProducts.map((product) => (
                          <tr key={product._id} className="um-table-row">
                            <td>
                              <div className="um-user-info">
                                <div className="um-user-avatar-container">
                                  <img
                                    src={
                                      product.product_imageurl?.[0] ||
                                      "/images/default-product.png"
                                    }
                                    alt={product.product_name}
                                    className="um-user-avatar"
                                    onError={(e) => {
                                      e.target.src =
                                        "/images/default-product.png";
                                    }}
                                  />
                                </div>
                                <div className="um-user-details">
                                  <span className="um-username">
                                    {product.product_name}
                                  </span>
                                  <small className="um-user-id">
                                    ID: {product._id.slice(-8)}
                                  </small>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className="um-balance">
                                {formatCurrency(product.product_price)}
                              </span>
                            </td>
                            <td>
                              <span
                                className={
                                  product.product_quantity === 0
                                    ? "text-danger"
                                    : ""
                                }
                              >
                                {product.product_quantity}
                                {product.product_quantity === 0 &&
                                  " (Hết hàng)"}
                              </span>
                            </td>
                            <td>
                              <span
                                className={`um-role-badge ${getStatusBadgeColor(
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
                            </td>
                            <td>
                              <span>{formatDate(product.createdAt)}</span>
                            </td>
                            {/* <td>
                              <div className="um-action-buttons">
                                <button
                                  onClick={() =>
                                    handleDeleteProduct(product._id, "")
                                  }
                                  className="um-btn-action um-btn-delete"
                                  title="Xóa sản phẩm"
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              </div>
                            </td> */}
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
          <div
            className="um-modal-overlay"
            onClick={() => setShowReportModal(false)}
          >
            <div
              className="um-modal-content"
              onClick={(e) => e.stopPropagation()}
            >
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
                      <span>
                        {selectedReport.product_id?.product_name ||
                          "Sản phẩm đã xóa"}
                      </span>
                    </div>
                    <div className="um-detail-item">
                      <label>Người báo cáo:</label>
                      <span>
                        {selectedReport.reporter_id?.username || "N/A"}
                      </span>
                    </div>
                    <div className="um-detail-item">
                      <label>Shop:</label>
                      <span>{selectedReport.shop_id?.username || "N/A"}</span>
                    </div>
                    <div className="um-detail-item">
                      <label>Lý do:</label>
                      <span>{selectedReport.reason}</span>
                    </div>
                    <div className="um-detail-item">
                      <label>Mô tả:</label>
                      <div className="um-reason-cell">
                        {selectedReport.description || "Không có"}
                      </div>
                    </div>
                    <div className="um-detail-item">
                      <label>Ngày báo cáo:</label>
                      <span>{formatDate(selectedReport.createdAt)}</span>
                    </div>
                    <div className="um-detail-item">
                      <label>Trạng thái:</label>
                      <span
                        className={`um-role-badge ${getReportStatusBadgeColor(
                          selectedReport.status
                        )}`}
                      >
                        {selectedReport.status === "pending"
                          ? "Chờ xử lý"
                          : selectedReport.status === "approved"
                          ? "Đã chấp nhận"
                          : selectedReport.status === "rejected"
                          ? "Đã từ chối"
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {selectedReport.status === "pending" && (
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
                      style={{ width: "100%", resize: "vertical" }}
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
                {selectedReport.status === "pending" ? (
                  <>
                    <button
                      onClick={() =>
                        handleReportAction(
                          selectedReport._id,
                          "approve",
                          adminNote
                        )
                      }
                      className="um-btn um-btn-success"
                    >
                      <i className="fas fa-check"></i>
                      Chấp nhận báo cáo
                    </button>
                    <button
                      onClick={() =>
                        handleReportAction(
                          selectedReport._id,
                          "reject",
                          adminNote
                        )
                      }
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
      </div>

      {/* Modal nhập lý do xóa sản phẩm */}
      {showDeleteModal && (
        <div
          className="um-modal-overlay"
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="um-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="um-modal-header">
              <h3>
                <i className="fas fa-trash"></i>
                Xóa sản phẩm
              </h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="um-close-btn"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="um-modal-body">
              <p>Bạn có chắc chắn muốn xóa sản phẩm này không?</p>
              <label>Lý do xóa (tùy chọn):</label>
              <textarea
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="Nhập lý do xóa sản phẩm..."
                className="um-form-input"
                rows="3"
                style={{ width: "100%", resize: "vertical" }}
              />
            </div>
            <div className="um-modal-footer">
              <button
                onClick={async () => {
                  await handleDeleteProduct(deletingProductId, deleteReason);
                  setShowDeleteModal(false);
                  setDeleteReason("");
                  setDeletingProductId(null);
                }}
                className="um-btn um-btn-danger"
              >
                <i className="fas fa-trash"></i>
                Xóa
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteReason("");
                  setDeletingProductId(null);
                }}
                className="um-btn um-btn-secondary"
              >
                <i className="fas fa-times"></i>
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal nhập lý do ẩn sản phẩm */}
      {showHideModal && (
        <div
          className="um-modal-overlay"
          onClick={() => setShowHideModal(false)}
        >
          <div
            className="um-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="um-modal-header">
              <h3>
                <i className="fas fa-eye-slash"></i>
                Ẩn sản phẩm
              </h3>
              <button
                onClick={() => setShowHideModal(false)}
                className="um-close-btn"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="um-modal-body">
              <p>Bạn có chắc chắn muốn ẩn sản phẩm này không?</p>
              <label>Lý do ẩn (bắt buộc):</label>
              <textarea
                value={hideReason}
                onChange={(e) => setHideReason(e.target.value)}
                placeholder="Nhập lý do ẩn sản phẩm..."
                className="um-form-input"
                rows="3"
                style={{ width: "100%", resize: "vertical" }}
              />
            </div>
            <div className="um-modal-footer">
              <button
                onClick={async () => {
                  if (!hideReason.trim()) {
                    toast.error("Vui lòng nhập lý do ẩn sản phẩm!");
                    return;
                  }
                  await handleToggleProductStatus(
                    hidingProductId,
                    "available",
                    hideReason
                  );
                  setShowHideModal(false);
                  setHideReason("");
                  setHidingProductId(null);
                }}
                className="um-btn um-btn-danger"
              >
                <i className="fas fa-eye-slash"></i>
                Ẩn
              </button>
              <button
                onClick={() => {
                  setShowHideModal(false);
                  setHideReason("");
                  setHidingProductId(null);
                }}
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

export default AdminShopManagement;
