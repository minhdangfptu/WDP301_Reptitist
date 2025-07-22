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

  // State management - Updated to match ShopProductManagement exactly
  const [stats, setStats] = useState({
    total: 0,           // Same field name as ShopProductManagement
    available: 0,       // Same field name as ShopProductManagement  
    draft: 0,           // Same field name as ShopProductManagement
    inventoryValue: 0,  // Same field name as ShopProductManagement
    totalOrders: 0,     // Additional dashboard field
    pendingOrders: 0,   // Additional dashboard field
    totalRevenue: 0     // Additional dashboard field
  });

  const [chartData, setChartData] = useState({
    bestSellingProductsByTime: [],
    productRevenueShare: [],
    dailyRevenue: [],
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

  // Fetch shop data - Enhanced with detailed debugging
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

      console.log('🔥 ShopDashboard: Fetching data using SAME API as ShopProductManagement...');

      // ===== STEP 1: Enhanced API call with detailed logging =====
      const response = await axios.get(
        `${baseUrl}/reptitist/shop/my-stats`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // ===== DETAILED LOGGING =====
      console.log('✅ Raw API Response:', response);
      console.log('📊 Response Status:', response.status);
      console.log('📊 Response Data (full):', response.data);
      console.log('📊 Response Data Type:', typeof response.data);
      console.log('📊 Response Data Keys:', Object.keys(response.data || {}));

      // Try different data extraction paths
      const dataOption1 = response.data;
      const dataOption2 = response.data.data;
      const dataOption3 = response.data.result;

      console.log('🎯 Data Option 1 (response.data):', dataOption1);
      console.log('🎯 Data Option 2 (response.data.data):', dataOption2);
      console.log('🎯 Data Option 3 (response.data.result):', dataOption3);

      // Try to extract stats from different possible structures
      let extractedStats = null;

      if (dataOption2 && typeof dataOption2 === 'object') {
        extractedStats = dataOption2;
        console.log('📈 Using dataOption2 (response.data.data)');
      } else if (dataOption1 && typeof dataOption1 === 'object') {
        extractedStats = dataOption1;
        console.log('📈 Using dataOption1 (response.data)');
      } else if (dataOption3 && typeof dataOption3 === 'object') {
        extractedStats = dataOption3;
        console.log('📈 Using dataOption3 (response.data.result)');
      }

      if (extractedStats) {
        console.log('🎯 Extracted Stats Object:', extractedStats);
        console.log('🎯 Stats Keys:', Object.keys(extractedStats));
        console.log('🎯 Individual Fields:', {
          total: extractedStats.total,
          available: extractedStats.available,
          draft: extractedStats.draft,
          inventoryValue: extractedStats.inventoryValue,
          // Also check alternative field names
          totalProducts: extractedStats.totalProducts,
          activeProducts: extractedStats.activeProducts,
          draftProducts: extractedStats.draftProducts,
          totalValue: extractedStats.totalValue
        });

        // Set stats with fallback field names
        const finalStats = {
          // Try primary field names first, then fallbacks
          total: extractedStats.total || extractedStats.totalProducts || 0,
          available: extractedStats.available || extractedStats.activeProducts || 0,
          draft: extractedStats.draft || extractedStats.draftProducts || 0,
          inventoryValue: extractedStats.inventoryValue || extractedStats.totalValue || 0,
          
          // Additional dashboard fields
          totalOrders: extractedStats.totalOrders || 0,
          pendingOrders: extractedStats.pendingOrders || 0,
          totalRevenue: extractedStats.totalRevenue || 0
        };

        setStats(finalStats);

        console.log('✅ Stats successfully set with values:', finalStats);

      } else {
        console.error('❌ Could not extract stats from response!');
        console.error('❌ Response structure:', response.data);
        
        // Set defaults
        setStats({
          total: 0,
          available: 0,
          draft: 0,
          inventoryValue: 0,
          totalOrders: 0,
          pendingOrders: 0,
          totalRevenue: 0
        });
      }

      // ===== STEP 2: Try dashboard chart data (optional) =====
      try {
        console.log('📈 Fetching additional dashboard chart data...');
        const dashboardResponse = await axios.get(
          `${baseUrl}/reptitist/products/shop/dashboard-stats`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: { timeFilter }
          }
        );

        const dashboardData = dashboardResponse.data.data;
        console.log('✅ Dashboard chart data received:', dashboardData);

        if (dashboardData) {
          // Update additional stats if available from dashboard API
          if (dashboardData.basicStats) {
            setStats(prevStats => ({
              ...prevStats,
              totalOrders: dashboardData.basicStats.totalOrders || prevStats.totalOrders,
              pendingOrders: dashboardData.basicStats.pendingOrders || prevStats.pendingOrders,
              totalRevenue: dashboardData.basicStats.totalRevenue || prevStats.totalRevenue
            }));
          }

          // Process chart data
          const processedChartData = {
            bestSellingProductsByTime: dashboardData.bestSellingProductsByTime?.slice(-15) || [],
            productRevenueShare: processProductRevenueShare(dashboardData.productRevenueStats || []),
            dailyRevenue: dashboardData.shopRevenueByTime?.slice(-30) || [],
            cumulativeRevenue: dashboardData.cumulativeRevenue?.slice(-30) || []
          };
          setChartData(processedChartData);
        }
      } catch (dashboardError) {
        console.warn('⚠️ Could not fetch dashboard chart data:', dashboardError.message);
        // Chart data is optional, main stats already loaded
        setChartData({
          bestSellingProductsByTime: [],
          productRevenueShare: [],
          dailyRevenue: [],
          cumulativeRevenue: []
        });
      }

      setChartsLoading(false);
      console.log('✅ ShopDashboard data loading completed');

    } catch (error) {
      console.error('❌ Fetch shop data error:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      
      // Set defaults on error
      setStats({
        total: 0,
        available: 0,
        draft: 0,
        inventoryValue: 0,
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
      percentage: product.percentage || 0
    }));
    
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
          <div className="um-loading-state">
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

        {/* Stats Dashboard - Updated to use SAME field names as ShopProductManagement */}
        <div className="um-stats-dashboard">
          <div className="um-stats-grid">
            <div className="um-stat-card um-stat-total">
              <div className="um-stat-icon">
                <i className="fas fa-cube"></i>
              </div>
              <div className="um-stat-content">
                <span className="um-stat-number">{formatNumber(stats.total)}</span>
                <span className="um-stat-label">Tổng sản phẩm</span>
                <span className="um-stat-percentage">Tất cả sản phẩm</span>
              </div>
            </div>

            <div className="um-stat-card um-stat-active">
              <div className="um-stat-icon">
                <i className="fas fa-check-circle"></i>
              </div>
              <div className="um-stat-content">
                <span className="um-stat-number">{formatNumber(stats.available)}</span>
                <span className="um-stat-label">Đang bán</span>
                <span className="um-stat-percentage">Sản phẩm hoạt động</span>
              </div>
            </div>

            <div className="um-stat-card um-stat-shop">
              <div className="um-stat-icon">
                <i className="fas fa-pause-circle"></i>
              </div>
              <div className="um-stat-content">
                <span className="um-stat-number">{formatNumber(stats.draft)}</span>
                <span className="um-stat-label">Ngừng bán</span>
                <span className="um-stat-percentage">Sản phẩm tạm dừng</span>
              </div>
            </div>

            <div className="um-stat-card um-stat-customer">
              <div className="um-stat-icon">
                <i className="fas fa-money-bill-wave"></i>
              </div>
              <div className="um-stat-content">
                <span className="um-stat-number">{formatInventoryValue(stats.inventoryValue)}</span>
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
                <p>Xem và xử lý đơn hàng từ khách hàng</p>
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