
import React, { useEffect, useState } from 'react';
import { getMyOrders, getOrderDetail, updateOrderStatus, softDeleteOrder } from '../api/orderApi';
import ShopHeader from '../components/ShopHeader';
import '../css/CustomerOrderPage.css';
import { CartProvider } from '../context/CartContext';

const statusMap = {
  ordered: { label: 'Đang xử lý', class: 'pending' },
  shipped: { label: 'Đã gửi hàng', class: 'shipped' },
  delivered: { label: 'Đã giao', class: 'completed' },
  cancelled: { label: 'Đã hủy', class: 'cancelled' },
};

const CustomerOrderPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await getMyOrders();
      setOrders(data);
      setError('');
    } catch (err) {
      setOrders([]);
      setError('Không thể tải đơn hàng.');
    } finally {
      setLoading(false);
    }
  };

  const openOrderDetail = async (orderId) => {
    setDetailLoading(true);
    setActionError('');
    try {
      const detail = await getOrderDetail(orderId);
      setSelectedOrder(detail);
    } catch (err) {
      setActionError('Không thể tải chi tiết đơn hàng.');
      setSelectedOrder(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeOrderDetail = () => {
    setSelectedOrder(null);
    setActionError('');
  };

  const handleStatusChange = async (orderId, status) => {
    setActionLoading(true);
    setActionError('');
    try {
      await updateOrderStatus(orderId, status);
      await fetchOrders();
      if (selectedOrder && selectedOrder._id === orderId) {
        const detail = await getOrderDetail(orderId);
        setSelectedOrder(detail);
      }
    } catch (err) {
      setActionError('Không thể cập nhật trạng thái đơn hàng.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSoftDelete = async (orderId) => {
    setActionLoading(true);
    setActionError('');
    try {
      await softDeleteOrder(orderId);
      await fetchOrders();
      closeOrderDetail();
    } catch (err) {
      setActionError('Không thể xóa đơn hàng.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <>
      <ShopHeader />
      <div className="order-page">
        <div className="container">
          <div className="order-content">
            <h2>Đơn hàng của bạn</h2>
            {loading ? (
              <div className="order-loading">Đang tải đơn hàng...</div>
            ) : error ? (
              <div className="order-error">{error}</div>
            ) : orders.length === 0 ? (
              <div className="order-empty">Bạn chưa có đơn hàng nào.</div>
            ) : (
              <div className="order-list">
                {orders.map(order => (
                  <div className="order-item" key={order._id}>
                    <div className="order-header">
                      <div className="order-id">Mã đơn: {order._id.slice(-8)}</div>
                      <div className="order-date">Ngày đặt: {new Date(order.order_date).toLocaleString('vi-VN')}</div>
                      <div className={`order-status ${statusMap[order.order_status]?.class || ''}`}>
                        {statusMap[order.order_status]?.label || order.order_status}
                      </div>
                    </div>
                    <div className="order-details">
                      <div className="order-products">
                        <b>Sản phẩm:</b>
                        <ul>
                          {order.order_items.map((item, idx) => (
                            <li key={idx}>
                              <span>Mã SP: {typeof item.product_id === 'object' ? item.product_id._id || item.product_id : item.product_id}</span>
                              {item.product_id?.product_name && (
                                <span> - {item.product_id.product_name}</span>
                              )}
                              <span> | SL: {item.quantity}</span>
                            </li>
                          ))}
                        </ul>
                        <div><b>Tổng tiền:</b> {order.order_price.toLocaleString()}₫</div>
                      </div>
                      <button className="view-order-btn" onClick={() => openOrderDetail(order._id)}>
                        Xem chi tiết
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal chi tiết đơn hàng */}
      {selectedOrder && (
        <div className="order-modal-overlay" onClick={closeOrderDetail}>
          <div className="order-modal" onClick={e => e.stopPropagation()}>
            <div className="order-modal-header">
              <h3>Chi tiết đơn hàng</h3>
              <button className="order-modal-close" onClick={closeOrderDetail}>&times;</button>
            </div>
            {detailLoading ? (
              <div className="order-loading">Đang tải chi tiết...</div>
            ) : (
              <>
                <div className="order-modal-info">
                  <div><b>Mã đơn:</b> {selectedOrder._id}</div>
                  <div><b>Ngày đặt:</b> {new Date(selectedOrder.order_date).toLocaleString('vi-VN')}</div>
                  <div><b>Trạng thái:</b> <span className={`order-status ${statusMap[selectedOrder.order_status]?.class || ''}`}>{statusMap[selectedOrder.order_status]?.label || selectedOrder.order_status}</span></div>
                  <div><b>Tổng tiền:</b> {selectedOrder.order_price.toLocaleString()}₫</div>
                  <div><b>Shop:</b> {selectedOrder.shop_id?.username || selectedOrder.shop_id || 'N/A'}</div>
                </div>
                <div className="order-modal-products">
                  <b>Sản phẩm:</b>
                  <ul>
                    {selectedOrder.order_items.map((item, idx) => (
                      <li key={idx}>
                        <span>Mã SP: {typeof item.product_id === 'object' ? item.product_id._id || item.product_id : item.product_id}</span>
                        {item.product_id?.product_name && (
                          <span> - {item.product_id.product_name}</span>
                        )}
                        <span> | SL: {item.quantity}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                {actionError && <div className="order-error">{actionError}</div>}
                <div className="order-modal-actions">
                  {/* Hủy đơn: chỉ khi trạng thái là ordered */}
                  {selectedOrder.order_status === 'ordered' && (
                    <button className="order-action-btn cancel" disabled={actionLoading} onClick={() => handleStatusChange(selectedOrder._id, 'cancelled')}>
                      Hủy đơn
                    </button>
                  )}
                  {/* Xác nhận đã nhận hàng: chỉ khi trạng thái là shipped */}
                  {selectedOrder.order_status === 'shipped' && (
                    <button className="order-action-btn confirm" disabled={actionLoading} onClick={() => handleStatusChange(selectedOrder._id, 'delivered')}>
                      Xác nhận đã nhận hàng
                    </button>
                  )}
                  {/* Xóa mềm: chỉ khi trạng thái là cancelled hoặc delivered */}
                  {(selectedOrder.order_status === 'cancelled' || selectedOrder.order_status === 'delivered') && (
                    <button className="order-action-btn delete" disabled={actionLoading} onClick={() => handleSoftDelete(selectedOrder._id)}>
                      Xóa đơn
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

const CustomerOrderPageWithCart = () => (
  <CartProvider>
    <CustomerOrderPage />
  </CartProvider>
);

export default CustomerOrderPageWithCart;
