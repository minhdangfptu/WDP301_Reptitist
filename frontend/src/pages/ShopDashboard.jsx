import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import '../css/ShopDashboard.css';

const ShopDashboard = () => {
  const { user, canSellProduct } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Kiểm tra quyền truy cập
    if (!canSellProduct()) {
      toast.error('Bạn không có quyền truy cập trang này');
      navigate('/');
      return;
    }

    fetchShopStats();
  }, [canSellProduct, navigate]);

  const fetchShopStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      
      // Fetch shop statistics
      const [productsRes, ordersRes] = await Promise.all([
        axios.get(`http://localhost:5000/reptitist/shop/my-products`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`http://localhost:5000/reptitist/orders/shop-orders`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const products = productsRes.data || [];
      const orders = ordersRes.data.orders || [];

      setStats({
        totalProducts: products.length,
        activeProducts: products.filter(p => p.product_status === 'available').length,
        totalOrders: orders.length,
        pendingOrders: orders.filter(o => o.order_status === 'ordered').length,
        totalRevenue: orders
          .filter(o => o.order_status === 'delivered')
          .reduce((sum, o) => sum + (o.order_price || 0), 0)
      });
    } catch (error) {
      console.error('Error fetching shop stats:', error);
      toast.error('Không thể tải thống kê cửa hàng');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="shop-dashboard-container">
          <div className="shop-dashboard-loading">
            <div className="loading-spinner"></div>
            <p>Đang tải thông tin cửa hàng...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="shop-dashboard-container">
        <div className="shop-dashboard-header">
          <h1>Tổng quan cửa hàng</h1>
          <p>Chào mừng bạn trở lại, {user?.fullname || user?.username}!</p>
        </div>

        <div className="shop-dashboard-stats">
          <div className="stat-card">
            <div className="stat-icon">📦</div>
            <div className="stat-content">
              <h3>{stats.totalProducts}</h3>
              <p>Tổng sản phẩm</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3>{stats.activeProducts}</h3>
              <p>Sản phẩm đang bán</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🛒</div>
            <div className="stat-content">
              <h3>{stats.totalOrders}</h3>
              <p>Tổng đơn hàng</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-content">
              <h3>{stats.pendingOrders}</h3>
              <p>Đơn hàng chờ xử lý</p>
            </div>
          </div>

          <div className="stat-card stat-card-revenue">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <h3>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.totalRevenue)}</h3>
              <p>Doanh thu</p>
            </div>
          </div>
        </div>

        <div className="shop-dashboard-actions">
          <div className="action-card" onClick={() => navigate('/ShopProductManagement')}>
            <div className="action-icon">📝</div>
            <h3>Quản lý sản phẩm</h3>
            <p>Thêm, chỉnh sửa hoặc xóa sản phẩm của bạn</p>
          </div>

          <div className="action-card" onClick={() => navigate('/shop/products/create')}>
            <div className="action-icon">➕</div>
            <h3>Thêm sản phẩm mới</h3>
            <p>Tạo sản phẩm mới để bán</p>
          </div>

          <div className="action-card" onClick={() => navigate('/OrderManagement')}>
            <div className="action-icon">📋</div>
            <h3>Quản lý đơn hàng</h3>
            <p>Xem và xử lý đơn hàng từ khách hàng</p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ShopDashboard; 