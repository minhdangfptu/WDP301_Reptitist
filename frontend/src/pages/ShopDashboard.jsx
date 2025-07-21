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
    bestSellingProductsByTime: [], // Biểu đồ cột: Sản phẩm bán chạy theo thời gian
    productRevenueShare: [], // Biểu đồ bánh: % doanh số từ từng sản phẩm
    dailyRevenue: [], // Biểu đồ đường: Doanh số theo ngày
    cumulativeRevenue: [] // Biểu đồ đường/cột: Doanh số tích lũy
  });

  const [loading, setLoading] = useState(true);
  const [chartsLoading, setChartsLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('day'); // day, month, year

  // Permission check
  useEffect(() => {
    if (!canSellProduct()) {
      toast.error('Bạn không có quyền truy cập trang này');
      navigate('/');
      return;
    }
    fetchShopData();
  }, [canSellProduct, navigate, timeFilter]);

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

      // Fetch basic stats
      const statsResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/products/shop/dashboard-stats`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { timeFilter }
        }
      );

      const data = statsResponse.data.data;

      // Guard: If data or data.basicStats is missing, set default and return
      if (!data || !data.basicStats) {
        setStats({
          totalProducts: 0,
          activeProducts: 0,
          totalOrders: 0,
          pendingOrders: 0,
          totalRevenue: 0
        });
        setChartData({
          bestSellingProductsByTime: [],
          productRevenueShare: [],
          dailyRevenue: [],
          cumulativeRevenue: []
        });
        setChartsLoading(false);
        setLoading(false);
        return;
      }

      // Update stats
      setStats(data.basicStats);

      // Process chart data
      const processedChartData = {
        // 1. Biểu đồ cột: Top sản phẩm bán chạy theo thời gian
        bestSellingProductsByTime: data.bestSellingProductsByTime?.slice(-15) || [],
        
        // 2. Biểu đồ bánh: % doanh số từ từng sản phẩm
        productRevenueShare: processProductRevenueShare(data.productRevenueStats || []),
        
        // 3. Biểu đồ đường: Doanh số theo thời gian
        dailyRevenue: data.shopRevenueByTime?.slice(-30) || [],
        
        // 4. Biểu đồ tích lũy: Doanh số tổng tăng dần
        cumulativeRevenue: data.cumulativeRevenue?.slice(-30) || []
      };

      setChartData(processedChartData);
      setChartsLoading(false);

    } catch (error) {
      console.error('Fetch shop data error:', error);
      toast.error('Lỗi khi tải dữ liệu dashboard');
      setChartsLoading(false);
    } finally {
      setLoading(false);
    }
  };

  // Process product revenue share for pie chart
  const processProductRevenueShare = (productStats) => {
    if (!productStats || productStats.length === 0) return [];
    
    // Sort by revenue descending
    const sortedProducts = [...productStats].sort((a, b) => b.revenue - a.revenue);
    
    // Take top 8 products, group rest as "Khác"
    const topProducts = sortedProducts.slice(0, 8);
    const otherProducts = sortedProducts.slice(8);
    
    const result = topProducts.map(product => ({
      name: product.productName || 'Không xác định',
      value: product.revenue || 0,
      percentage: product.percentage || 0
    }));
    
    // Add "Others" if there are more products
    if (otherProducts.length > 0) {
      const othersRevenue = otherProducts.reduce((sum, p) => sum + (p.revenue || 0), 0);
      const othersPercentage = otherProducts.reduce((sum, p) => sum + (p.percentage || 0), 0);
      
      result.push({
        name: `Khác (${otherProducts.length} sản phẩm)`,
        value: othersRevenue,
        percentage: othersPercentage
      });
    }
    
    return result;
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Format number
  const formatNumber = (num) => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  // Custom tooltip for revenue charts
  const RevenueTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{`${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.dataKey === 'revenue' || entry.dataKey === 'cumulativeRevenue' || entry.dataKey === 'dailyRevenue' 
                ? formatCurrency(entry.value) 
                : formatNumber(entry.value)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for pie chart
  const PieTooltip = ({ active, payload }) => {
    if (active && payload && payload[0]) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{data.name}</p>
          <p style={{ color: payload[0].color }}>
            {formatCurrency(data.value)} ({data.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="um-user-list-container">
          <div className="um-loading-container">
            <div className="um-spinner"></div>
            <p>Đang tải dashboard...</p>
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
          <div className="um-header-content">
            <div className="um-header-text">
              <h1>
                <i className="fas fa-store"></i>
                Dashboard Cửa hàng
              </h1>
              <p>Quản lý và theo dõi hiệu suất kinh doanh của bạn</p>
            </div>
            <div className="um-header-actions">
              <div className="time-filter-buttons">
                <button 
                  className={`filter-btn ${timeFilter === 'day' ? 'active' : ''}`}
                  onClick={() => setTimeFilter('day')}
                >
                  Theo ngày
                </button>
                <button 
                  className={`filter-btn ${timeFilter === 'month' ? 'active' : ''}`}
                  onClick={() => setTimeFilter('month')}
                >
                  Theo tháng
                </button>
                <button 
                  className={`filter-btn ${timeFilter === 'year' ? 'active' : ''}`}
                  onClick={() => setTimeFilter('year')}
                >
                  Theo năm
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="um-stats-grid">
          <div className="um-stat-card um-stat-total">
            <div className="um-stat-icon">
              <i className="fas fa-cube"></i>
            </div>
            <div className="um-stat-content">
              <div className="um-stat-value">{formatNumber(stats.totalProducts)}</div>
              <div className="um-stat-label">Tổng sản phẩm</div>
            </div>
          </div>

          <div className="um-stat-card um-stat-active">
            <div className="um-stat-icon">
              <i className="fas fa-check-circle"></i>
            </div>
            <div className="um-stat-content">
              <div className="um-stat-value">{formatNumber(stats.activeProducts)}</div>
              <div className="um-stat-label">Sản phẩm đang bán</div>
            </div>
          </div>

          <div className="um-stat-card um-stat-shop">
            <div className="um-stat-icon">
              <i className="fas fa-shopping-cart"></i>
            </div>
            <div className="um-stat-content">
              <div className="um-stat-value">{formatNumber(stats.totalOrders)}</div>
              <div className="um-stat-label">Tổng đơn hàng</div>
            </div>
          </div>

          <div className="um-stat-card um-stat-customer">
            <div className="um-stat-icon">
              <i className="fas fa-clock"></i>
            </div>
            <div className="um-stat-content">
              <div className="um-stat-value">{formatNumber(stats.pendingOrders)}</div>
              <div className="um-stat-label">Đơn chờ xử lý</div>
            </div>
          </div>

          <div className="um-stat-card um-stat-admin">
            <div className="um-stat-icon">
              <i className="fas fa-money-bill-wave"></i>
            </div>
            <div className="um-stat-content">
              <div className="um-stat-value">{formatCurrency(stats.totalRevenue)}</div>
              <div className="um-stat-label">Tổng doanh thu</div>
            </div>
          </div>
        </div>

        {/* Charts Section - 2 rows, 2 charts each */}
        <div className="charts-section">
          {/* First Row */}
          <div className="charts-row">
            {/* Chart 1: Biểu đồ cột - Sản phẩm bán chạy theo thời gian */}
            <div className="chart-card">
              <h3>
                <i className="fas fa-chart-bar"></i>
                Sản phẩm bán chạy nhất theo {timeFilter === 'day' ? 'ngày' : timeFilter === 'month' ? 'tháng' : 'năm'}
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
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip content={<RevenueTooltip />} />
                    <Legend />
                    <Bar dataKey="quantity" fill="#2563eb" name="Số lượng bán" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Chart 2: Biểu đồ bánh - Doanh số từ từng sản phẩm */}
            <div className="chart-card">
              <h3>
                <i className="fas fa-chart-pie"></i>
                Phân bổ doanh số theo sản phẩm
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
                      data={chartData.productRevenueShare}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name} (${percentage}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.productRevenueShare.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Second Row */}
          <div className="charts-row">
            {/* Chart 3: Biểu đồ đường - Doanh số theo thời gian */}
            <div className="chart-card">
              <h3>
                <i className="fas fa-chart-line"></i>
                Doanh số theo {timeFilter === 'day' ? 'ngày' : timeFilter === 'month' ? 'tháng' : 'năm'}
              </h3>
              {chartsLoading ? (
                <div className="chart-loading">
                  <div className="um-spinner"></div>
                  <p>Đang tải biểu đồ...</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData.dailyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip content={<RevenueTooltip />} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#059669" 
                      strokeWidth={3}
                      name="Doanh số"
                      dot={{ fill: '#059669', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Chart 4: Biểu đồ kết hợp - Doanh số tích lũy */}
            <div className="chart-card">
              <h3>
                <i className="fas fa-chart-area"></i>
                Doanh số tích lũy theo {timeFilter === 'day' ? 'ngày' : timeFilter === 'month' ? 'tháng' : 'năm'}
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
                    <Tooltip content={<RevenueTooltip />} />
                    <Legend />
                    <Bar dataKey="dailyRevenue" fill="#d97706" name="Doanh số ngày" />
                    <Line 
                      type="monotone" 
                      dataKey="cumulativeRevenue" 
                      stroke="#7c3aed" 
                      strokeWidth={3}
                      name="Doanh số tích lũy"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </div>
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
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ShopDashboard;