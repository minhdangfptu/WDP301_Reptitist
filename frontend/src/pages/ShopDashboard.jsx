import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useNavigate, Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
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
import { baseUrl } from '../config';

const ShopDashboard = () => {
  const { user, canSellProduct } = useAuth();
  const navigate = useNavigate();

  // State management
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    draftProducts: 0,
    totalValue: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0
  });

  const [chartData, setChartData] = useState({
    bestSellingProductsByTime: [],
    productRevenueShare: [],
    shopRevenueByTime: [],
    cumulativeRevenue: []
  });

  const [loading, setLoading] = useState(true);
  const [chartsLoading, setChartsLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('day');

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

  // ✅ SỬA: Chỉ gọi 1 API và xử lý response đúng cách
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

      console.log('🔥 ShopDashboard: Fetching dashboard data with order stats...');

      // ✅ GỌI ĐÚNG API dashboard-stats
      const response = await axios.get(
        `${baseUrl}/reptitist/shop/dashboard-stats`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { timeFilter }
        }
      );

      console.log('✅ Dashboard Response:', response.data);

      // ✅ XỬ LÝ RESPONSE ĐÚNG CÁCH
      let dashboardData = null;
      
      // Kiểm tra các cấu trúc response có thể có
      if (response.data?.success && response.data?.data) {
        dashboardData = response.data.data;
      } else if (response.data?.data) {
        dashboardData = response.data.data;
      } else if (response.data && typeof response.data === 'object') {
        dashboardData = response.data;
      }

      if (dashboardData) {
        console.log('📊 Dashboard Data:', dashboardData);
        
        // Extract basicStats (includes order data)
        const basicStats = dashboardData.basicStats || dashboardData;
        
        console.log('📈 Basic Stats:', basicStats);
        
        setStats({
          totalProducts: basicStats.totalProducts || 0,
          activeProducts: basicStats.activeProducts || 0,
          draftProducts: basicStats.draftProducts || 0,
          totalValue: basicStats.totalValue || 0,
          totalOrders: basicStats.totalOrders || 0,
          pendingOrders: basicStats.pendingOrders || 0,
          totalRevenue: basicStats.totalRevenue || 0
        });

        // Process chart data nếu có
        const processedChartData = {
          bestSellingProductsByTime: dashboardData.bestSellingProductsByTime?.slice(-15) || [],
          productRevenueShare: processProductRevenueShare(dashboardData.productRevenueStats || []),
          shopRevenueByTime: dashboardData.shopRevenueByTime?.slice(-30) || [],
          cumulativeRevenue: dashboardData.cumulativeRevenue?.slice(-30) || []
        };
        
        console.log('📈 Processed Chart Data:', processedChartData);
        setChartData(processedChartData);
        
      } else {
        console.warn('⚠️ No valid data structure found, using fallback API...');
        
        // ✅ FALLBACK: Nếu dashboard-stats không có data, gọi my-stats
        const fallbackResponse = await axios.get(
          `${baseUrl}/reptitist/shop/my-stats`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        console.log('📋 Fallback Response:', fallbackResponse.data);
        
        const fallbackData = fallbackResponse.data?.data || fallbackResponse.data;
        
        setStats({
          totalProducts: fallbackData.totalProducts || fallbackData.total || 0,
          activeProducts: fallbackData.activeProducts || fallbackData.available || 0,
          draftProducts: fallbackData.draftProducts || fallbackData.draft || 0,
          totalValue: fallbackData.totalValue || fallbackData.inventoryValue || 0,
          totalOrders: 0, // my-stats không có order data
          pendingOrders: 0, // my-stats không có order data
          totalRevenue: 0 // my-stats không có order data
        });

        // Empty chart data for fallback
        setChartData({
          bestSellingProductsByTime: [],
          productRevenueShare: [],
          shopRevenueByTime: [],
          cumulativeRevenue: []
        });
      }

      setChartsLoading(false);
      console.log('✅ ShopDashboard data loading completed');

    } catch (error) {
      console.error('❌ Fetch shop data error:', error);
      console.error('❌ Error response:', error.response?.data);
      
      // Set defaults on error
      setStats({
        totalProducts: 0,
        activeProducts: 0,
        draftProducts: 0,
        totalValue: 0,
        totalOrders: 0,
        pendingOrders: 0,
        totalRevenue: 0
      });

      setChartData({
        bestSellingProductsByTime: [],
        productRevenueShare: [],
        shopRevenueByTime: [],
        cumulativeRevenue: []
      });

      toast.error('Lỗi khi tải dữ liệu dashboard: ' + (error.response?.data?.message || error.message));
      setChartsLoading(false);
    } finally {
      setLoading(false);
    }
  };

  // Process product revenue share for pie chart
  const processProductRevenueShare = (productStats) => {
    if (!productStats || productStats.length === 0) return [];
    
    const sortedProducts = [...productStats].sort((a, b) => b.revenue - a.revenue);
    const topProducts = sortedProducts.slice(0, 8);
    const otherProducts = sortedProducts.slice(8);
    
    const result = topProducts.map(product => ({
      name: product.productName || 'Không xác định',
      value: product.revenue || 0,
      percentage: parseFloat(product.percentage) || 0
    }));
    
    if (otherProducts.length > 0) {
      const othersRevenue = otherProducts.reduce((sum, p) => sum + (p.revenue || 0), 0);
      const othersPercentage = otherProducts.reduce((sum, p) => sum + (parseFloat(p.percentage) || 0), 0);
      
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
    if (amount == null || isNaN(amount)) return '0₫';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Format number
  const formatNumber = (num) => {
    if (num == null || isNaN(num)) return '0';
    return new Intl.NumberFormat('vi-VN').format(num);
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

  // Custom tooltip for revenue charts
  const RevenueTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{`${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: ${
                entry.dataKey === 'revenue' || 
                entry.dataKey === 'cumulativeRevenue' || 
                entry.dataKey === 'dailyRevenue'
                ? formatCurrency(entry.value) 
                : formatNumber(entry.value)
              }`}
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
            {formatCurrency(data.value)} ({data.percentage.toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom label for pie chart
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage }) => {
    if (percentage < 5) return null; // Don't show label for small slices
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="12"
        fontWeight="bold"
      >
        {`${percentage.toFixed(1)}%`}
      </text>
    );
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="um-user-list-container">
          <div className="um-loading-container">
            <div className="um-spinner"></div>
            <h3>Đang tải dashboard...</h3>
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

      <div className="um-user-list-container">
        {/* Page Header */}
        <div className="um-page-header">
          <div className="um-page-header-content">
            <div className="um-page-header-text">
              <h1>
                <i className="fas fa-tachometer-alt"></i>
                Dashboard Cửa hàng
              </h1>
              <p>Quản lý và theo dõi hiệu suất kinh doanh của bạn</p>
              <div className="um-header-breadcrumb">
                <Link to="/">Trang chủ</Link>
                <i className="fas fa-chevron-right"></i>
                <span>Dashboard</span>
              </div>
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

        {/* Stats Dashboard */}
        <div className="um-stats-dashboard">
          <div className="um-stats-grid">
            <div className="um-stat-card um-stat-total">
              <div className="um-stat-icon">
                <i className="fas fa-cube"></i>
              </div>
              <div className="um-stat-content">
                <span className="um-stat-number">{formatNumber(stats.totalProducts)}</span>
                <span className="um-stat-label">Tổng sản phẩm</span>
                <span className="um-stat-percentage">Tất cả sản phẩm</span>
              </div>
            </div>

            <div className="um-stat-card um-stat-active">
              <div className="um-stat-icon">
                <i className="fas fa-check-circle"></i>
              </div>
              <div className="um-stat-content">
                <span className="um-stat-number">{formatNumber(stats.activeProducts)}</span>
                <span className="um-stat-label">Đang bán</span>
                <span className="um-stat-percentage">Sản phẩm hoạt động</span>
              </div>
            </div>

            <div className="um-stat-card um-stat-shop">
              <div className="um-stat-icon">
                <i className="fas fa-pause-circle"></i>
              </div>
              <div className="um-stat-content">
                <span className="um-stat-number">{formatNumber(stats.draftProducts)}</span>
                <span className="um-stat-label">Ngừng bán</span>
                <span className="um-stat-percentage">Sản phẩm tạm dừng</span>
              </div>
            </div>

            <div className="um-stat-card um-stat-customer">
              <div className="um-stat-icon">
                <i className="fas fa-money-bill-wave"></i>
              </div>
              <div className="um-stat-content">
                <span className="um-stat-number">{formatInventoryValue(stats.totalValue)}</span>
                <span className="um-stat-label">Giá trị kho</span>
                <span className="um-stat-percentage">Tổng giá trị hàng tồn</span>
              </div>
            </div>

            <div className="um-stat-card um-stat-admin">
              <div className="um-stat-icon">
                <i className="fas fa-shopping-cart"></i>
              </div>
              <div className="um-stat-content">
                <span className="um-stat-number">{formatNumber(stats.totalOrders)}</span>
                <span className="um-stat-label">Đơn hàng</span>
                <span className="um-stat-percentage">Tổng đơn đã nhận</span>
              </div>
            </div>

            <div className="um-stat-card um-stat-inactive">
              <div className="um-stat-icon">
                <i className="fas fa-chart-line"></i>
              </div>
              <div className="um-stat-content">
                <span className="um-stat-number">{formatCurrency(stats.totalRevenue)}</span>
                <span className="um-stat-label">Doanh thu</span>
                <span className="um-stat-percentage">Tổng doanh thu</span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
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
              ) : chartData.bestSellingProductsByTime.length === 0 ? (
                <div className="chart-empty">
                  <i className="fas fa-chart-bar"></i>
                  <span>Chưa có dữ liệu bán hàng</span>
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
              ) : chartData.productRevenueShare.length === 0 ? (
                <div className="chart-empty">
                  <i className="fas fa-chart-pie"></i>
                  <span>Chưa có dữ liệu doanh số</span>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData.productRevenueShare}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.productRevenueShare.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                    <Legend />
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
              ) : chartData.shopRevenueByTime.length === 0 ? (
                <div className="chart-empty">
                  <i className="fas fa-chart-line"></i>
                  <span>Chưa có dữ liệu doanh số</span>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData.shopRevenueByTime}>
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
              ) : chartData.cumulativeRevenue.length === 0 ? (
                <div className="chart-empty">
                  <i className="fas fa-chart-area"></i>
                  <span>Chưa có dữ liệu tích lũy</span>
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

          <div className="um-table-container">
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
                <p>Xem và xử lý đơn hàng từ khách hàng ({stats.pendingOrders} đơn chờ xử lý)</p>
                <span className="action-arrow">
                  <i className="fas fa-arrow-right"></i>
                </span>
              </div>

              <div className="action-card" onClick={() => navigate('/ShopAnalytics')}>
                <div className="action-icon">
                  <i className="fas fa-chart-bar"></i>
                </div>
                <h4>Phân tích chi tiết</h4>
                <p>Xem báo cáo và phân tích kinh doanh chi tiết</p>
                <span className="action-arrow">
                  <i className="fas fa-arrow-right"></i>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ShopDashboard;