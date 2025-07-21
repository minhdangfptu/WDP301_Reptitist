import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import '../css/OrderManagement.css';

const OrderManagement = () => {
  const { user, canSellProduct } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    if (!canSellProduct()) {
      toast.error('Bạn không có quyền truy cập trang này');
      navigate('/');
      return;
    }

    fetchOrders();
  }, [canSellProduct, navigate, filterStatus]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      
      const response = await axios.get(`http://localhost:5000/reptitist/orders/shop-orders`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { status: filterStatus !== 'all' ? filterStatus : undefined }
      });

      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('access_token');
      
      if (newStatus === 'shipped') {
        await axios.put(`http://localhost:5000/reptitist/orders/mark-shipped-order`, {
          id: orderId
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        // For other status updates, use the general update endpoint
        await axios.get(`http://localhost:5000/reptitist/orders/update-order-status`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { id: orderId, status: newStatus }
        });
      }

      toast.success('Cập nhật trạng thái đơn hàng thành công');
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Không thể cập nhật trạng thái đơn hàng');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'ordered': { text: 'Đã đặt hàng', class: 'status-pending' },
      'shipped': { text: 'Đã gửi hàng', class: 'status-shipped' },
      'delivered': { text: 'Đã giao hàng', class: 'status-delivered' },
      'cancelled': { text: 'Đã hủy', class: 'status-cancelled' }
    };

    const config = statusConfig[status] || { text: status, class: 'status-default' };
    return <span className={`status-badge ${config.class}`}>{config.text}</span>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="order-management-container">
          <div className="order-management-loading">
            <div className="loading-spinner"></div>
            <p>Đang tải danh sách đơn hàng...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="order-management-container">
        <div className="order-management-header">
          <h1>Quản lý đơn hàng</h1>
          <p>Quản lý tất cả đơn hàng từ khách hàng</p>
        </div>

        <div className="order-management-filters">
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">Tất cả đơn hàng</option>
            <option value="ordered">Đã đặt hàng</option>
            <option value="shipped">Đã gửi hàng</option>
            <option value="delivered">Đã giao hàng</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        </div>

        <div className="orders-list">
          {orders.length === 0 ? (
            <div className="no-orders">
              <div className="no-orders-icon">📦</div>
              <h3>Chưa có đơn hàng nào</h3>
              <p>Khi có đơn hàng mới, chúng sẽ xuất hiện ở đây</p>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order._id} className="order-card">
                <div className="order-header">
                  <div className="order-info">
                    <h3>Đơn hàng #{order._id.slice(-8)}</h3>
                    <p className="order-date">Đặt hàng: {formatDate(order.created_at)}</p>
                  </div>
                  <div className="order-status">
                    {getStatusBadge(order.order_status)}
                  </div>
                </div>

                <div className="order-details">
                  <div className="customer-info">
                    <h4>Thông tin khách hàng</h4>
                    <p><strong>Tên:</strong> {order.customer_name}</p>
                    <p><strong>Email:</strong> {order.customer_email}</p>
                    <p><strong>SĐT:</strong> {order.customer_phone}</p>
                    <p><strong>Địa chỉ:</strong> {order.shipping_address}</p>
                  </div>

                  <div className="order-items">
                    <h4>Sản phẩm</h4>
                    {order.items?.map((item, index) => (
                      <div key={index} className="order-item">
                        <div className="item-info">
                          <img 
                            src={item.product_imageurl || '/default-product.png'} 
                            alt={item.product_name}
                            className="item-image"
                          />
                          <div className="item-details">
                            <h5>{item.product_name}</h5>
                            <p>Số lượng: {item.quantity}</p>
                            <p>Giá: {formatPrice(item.price)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="order-summary">
                    <div className="summary-item">
                      <span>Tổng tiền hàng:</span>
                      <span>{formatPrice(order.subtotal)}</span>
                    </div>
                    <div className="summary-item">
                      <span>Phí vận chuyển:</span>
                      <span>{formatPrice(order.shipping_fee)}</span>
                    </div>
                    <div className="summary-item total">
                      <span>Tổng cộng:</span>
                      <span>{formatPrice(order.total_amount)}</span>
                    </div>
                  </div>
                </div>

                <div className="order-actions">
                  {order.order_status === 'ordered' && (
                    <button 
                      className="btn btn-success"
                      onClick={() => updateOrderStatus(order._id, 'shipped')}
                    >
                      Đánh dấu đã gửi hàng
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default OrderManagement; 