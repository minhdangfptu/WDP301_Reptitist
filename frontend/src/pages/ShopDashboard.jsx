import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ComposedChart
} from 'recharts';
import '../css/ShopDashboard.css';

const ShopDashboard = () => {
  const { user, canSellProduct } = useAuth();
  const navigate = useNavigate();

  // State management
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0
  });

  const [chartData, setChartData] = useState({
    bestSellingProducts: [],
    categoryDistribution: [],
    monthlyRevenue: [],
    orderStatusStats: [],
    recentOrders: [],
    bestSellingProductsByTime: [],
    shopRevenueByTime: [],
    cumulativeRevenue: []
  });

  const [loading, setLoading] = useState(true);
  const [chartsLoading, setChartsLoading] = useState(true);

  // Permission check
  useEffect(() => {
    if (!canSellProduct()) {
      toast.error('Bạn không có quyền truy cập trang này');
      navigate('/');
      return;
    }
    fetchShopData();
  }, [canSellProduct, navigate]);

  // Colors for charts
  const CHART_COLORS = [
    '#2563eb', '#059669', '#dc2626', '#d97706', '#7c3aed',
    '#0891b2', '#be185d', '#059669', '#ea580c', '#4338ca'
  ];

  // Fetch all shop data
  const fetchShopData = async () => {
    try {
      setLoading(true);
      setChartsLoading(true);

      const token = localStorage.getItem('access_token');
      if (!token) {
        toast.error('Phiên đăng nhập đã hết hạn');
        navigate('/Login');
        return;
      }

      // Gọi API dashboard-stats để lấy tất cả dữ liệu
      const response = await axios.get(`http://localhost:5000/reptitist/shop/dashboard-stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const dashboardData = response.data.data;
      console.log('Dashboard data:', dashboardData);

      // Set basic stats
      setStats(dashboardData.basicStats);

      // Set chart data
      setChartData({
        bestSellingProducts: dashboardData.bestSellingProducts || [],
        categoryDistribution: dashboardData.categoryDistribution || [],
        monthlyRevenue: dashboardData.shopRevenueByTime || [],
        orderStatusStats: dashboardData.orderStatusStats || [],
        recentOrders: dashboardData.recentOrders || [],
        bestSellingProductsByTime: dashboardData.bestSellingProductsByTime || [],
        shopRevenueByTime: dashboardData.shopRevenueByTime || [],
        cumulativeRevenue: dashboardData.cumulativeRevenue || []
      });

      setLoading(false);
      setChartsLoading(false);

    } catch (error) {
      console.error('Error fetching shop data:', error);
      toast.error('Không thể tải thông tin cửa hàng');
      setLoading(false);
      setChartsLoading(false);
    }
  };

  // Custom tooltip for currency formatting
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  };

  // Loading state
  if (loading) {
    return (
      <>
        <Header />
        <div className="um-user-list-container">
          <div className="um-loading-state">
            <div className="um-spinner"></div>
            <h3>Đang tải thông tin cửa hàng...</h3>
            <p>Vui lòng chờ trong giây lát</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="um-user-list-container">
        {/* Page Header */}
        <div className="um-page-header">
          <div className="um-page-header-content">
            <div className="um-page-header-text">
              <h1>
                <i className="fas fa-store"></i>
                Tổng quan cửa hàng
              </h1>
              <p>Chào mừng bạn trở lại, {user?.fullname || user?.username}!</p>
              <div className="um-header-breadcrumb">
                <Link to="/">Trang chủ</Link>
                <i className="fas fa-chevron-right"></i>
                <span>Dashboard Shop</span>
              </div>
            </div>
            <div className="um-header-actions">
              <Link to="/shop/products/create" className="um-btn um-btn-primary">
                <i className="fas fa-plus"></i>
                Thêm sản phẩm
              </Link>
            </div>
          </div>
        </div>

        {/* Statistics Dashboard */}
        <div className="um-stats-dashboard">
          <div className="um-stats-grid">
            <div className="um-stat-card um-stat-total">
              <div className="um-stat-icon">
                <i className="fas fa-box"></i>
              </div>
              <div className="um-stat-content">
                <span className="um-stat-number">{stats.totalProducts}</span>
                <span className="um-stat-label">Tổng sản phẩm</span>
              </div>
            </div>

            <div className="um-stat-card um-stat-active">
              <div className="um-stat-icon">
                <i className="fas fa-check-circle"></i>
              </div>
              <div className="um-stat-content">
                <span className="um-stat-number">{stats.activeProducts}</span>
                <span className="um-stat-label">Đang bán</span>
              </div>
            </div>

            <div className="um-stat-card um-stat-shop">
              <div className="um-stat-icon">
                <i className="fas fa-shopping-cart"></i>
              </div>
              <div className="um-stat-content">
                <span className="um-stat-number">{stats.totalOrders}</span>
                <span className="um-stat-label">Tổng đơn hàng</span>
              </div>
            </div>

            <div className="um-stat-card um-stat-customer">
              <div className="um-stat-icon">
                <i className="fas fa-clock"></i>
              </div>
              <div className="um-stat-content">
                <span className="um-stat-number">{stats.pendingOrders}</span>
                <span className="um-stat-label">Chờ xử lý</span>
              </div>
            </div>

            <div className="um-stat-card um-stat-admin">
              <div className="um-stat-icon">
                <i className="fas fa-money-bill-wave"></i>
              </div>
              <div className="um-stat-content">
                <span className="um-stat-number">{formatCurrency(stats.totalRevenue)}</span>
                <span className="um-stat-label">Doanh thu</span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="transaction-charts-grid">
          {/* Biểu đồ cột: Sản phẩm bán chạy nhất theo từng thời gian */}
          <div className="chart-card">
            <h3>
              <i className="fas fa-chart-bar"></i>
              Sản phẩm bán chạy nhất theo thời gian
            </h3>
            {chartsLoading ? (
              <div className="chart-loading">
                <div className="um-spinner"></div>
                <p>Đang tải biểu đồ...</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.bestSellingProductsByTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="time"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={12}
                  />
                  <YAxis />
                  <Tooltip formatter={(value, name) => [
                    name === 'quantity' ? value : formatCurrency(value), 
                    name === 'quantity' ? 'Số lượng' : 'Doanh thu'
                  ]} />
                  <Legend />
                  <Bar dataKey="quantity" fill="#2563eb" name="Số lượng" />
                  <Bar dataKey="revenue" fill="#059669" name="Doanh thu" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Biểu đồ bánh: Doanh số từ từng sản phẩm */}
          <div className="chart-card">
            <h3>
              <i className="fas fa-chart-pie"></i>
              Doanh số từ từng sản phẩm (%)
            </h3>
            {chartsLoading ? (
              <div className="chart-loading">
                <div className="um-spinner"></div>
                <p>Đang tải biểu đồ...</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData.categoryDistribution}
                    dataKey="revenue"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percentage }) => `${name} ${percentage.toFixed(1)}%`}
                  >
                    {chartData.categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [formatCurrency(value), 'Doanh thu']} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Biểu đồ đường: Doanh số theo từng ngày */}
          <div className="chart-card chart-card-wide">
            <h3>
              <i className="fas fa-chart-line"></i>
              Doanh số theo từng ngày
            </h3>
            {chartsLoading ? (
              <div className="chart-loading">
                <div className="um-spinner"></div>
                <p>Đang tải biểu đồ...</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData.shopRevenueByTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => [formatCurrency(value), 'Doanh thu']} />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#2563eb"
                    strokeWidth={3}
                    dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Biểu đồ đường/cột: Doanh số tổng tăng dần */}
          <div className="chart-card chart-card-wide">
            <h3>
              <i className="fas fa-chart-area"></i>
              Doanh số tổng tăng dần theo thời gian
            </h3>
            {chartsLoading ? (
              <div className="chart-loading">
                <div className="um-spinner"></div>
                <p>Đang tải biểu đồ...</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={chartData.cumulativeRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value, name) => [
                    formatCurrency(value), 
                    name === 'cumulativeRevenue' ? 'Tổng doanh thu' : 'Doanh thu ngày'
                  ]} />
                  <Legend />
                  <Bar dataKey="dailyRevenue" fill="#059669" name="Doanh thu ngày" />
                  <Line
                    type="monotone"
                    dataKey="cumulativeRevenue"
                    stroke="#dc2626"
                    strokeWidth={3}
                    dot={{ fill: '#dc2626', strokeWidth: 2, r: 4 }}
                    name="Tổng doanh thu"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Trạng thái đơn hàng */}
          <div className="chart-card">
            <h3>
              <i className="fas fa-tasks"></i>
              Trạng thái đơn hàng
            </h3>
            {chartsLoading ? (
              <div className="chart-loading">
                <div className="um-spinner"></div>
                <p>Đang tải biểu đồ...</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.orderStatusStats} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="status" type="category" width={80} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#d97706" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="um-table-section">
          <div className="um-table-header">
            <h3>
              <i className="fas fa-bolt"></i>
              Thao tác nhanh
            </h3>
          </div>

          <div className="quick-actions-grid">
            <div className="action-card" onClick={() => navigate('/ShopProductManagement')}>
              <div className="action-icon">
                <i className="fas fa-edit"></i>
              </div>
              <h4>Quản lý sản phẩm</h4>
              <p>Thêm, chỉnh sửa hoặc xóa sản phẩm của bạn</p>
              <span className="action-arrow">
                <i className="fas fa-arrow-right"></i>
              </span>
            </div>

            <div className="action-card" onClick={() => navigate('/shop/products/create')}>
              <div className="action-icon">
                <i className="fas fa-plus-circle"></i>
              </div>
              <h4>Thêm sản phẩm mới</h4>
              <p>Tạo sản phẩm mới để bán trong cửa hàng</p>
              <span className="action-arrow">
                <i className="fas fa-arrow-right"></i>
              </span>
            </div>

            <div className="action-card" onClick={() => navigate('/OrderManagement')}>
              <div className="action-icon">
                <i className="fas fa-clipboard-list"></i>
              </div>
              <h4>Quản lý đơn hàng</h4>
              <p>Xem và xử lý đơn hàng từ khách hàng</p>
              <span className="action-arrow">
                <i className="fas fa-arrow-right"></i>
              </span>
            </div>

            <div className="action-card" onClick={() => navigate('/shop/analytics')}>
              <div className="action-icon">
                <i className="fas fa-chart-line"></i>
              </div>
              <h4>Báo cáo chi tiết</h4>
              <p>Xem thống kê và phân tích chi tiết</p>
              <span className="action-arrow">
                <i className="fas fa-arrow-right"></i>
              </span>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ShopDashboard;