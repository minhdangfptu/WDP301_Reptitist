import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import NavigationBar from '../components/NavigationBar';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../css/Transaction.css';
import { baseUrl } from '../config';
import {getTransactionHistory} from '../services/paymentService';
const Transaction = () => {
  const { user, hasRole } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState('30');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user, dateRange]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');

      if (!token) {
        setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        setLoading(false);
        return;
      }

      const response = await getTransactionHistory(dateRange);
      if (response) {
        setTransactions(response);
        console.log('Transactions fetched:', response);
        setError('');
      } else {
        setTransactions([]);
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
      if (err.response?.status === 401) {
        setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      } else if (err.response?.status === 404) {
        // No transactions found is not an error
        setTransactions([]);
        setError('');
      } else {
        setError('Không thể tải lịch sử giao dịch. Vui lòng thử lại sau.');
        setTransactions([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount) => {
    const absAmount = Math.abs(amount);
    const formatted = new Intl.NumberFormat('vi-VN').format(absAmount);
    return amount > 0 ? `+${formatted} VND` : `-${formatted} VND`;
  };

  const getAmountClass = (amount, status) => {
    if (status === 'paid') return 'paid';
    if (status === 'cancelled') return 'cancelled';
    return amount > 0 ? 'positive' : 'negative';
  };

  const getTransactionIcon = (type, amount, status) => {
    if (status === 'pending') {
      return (
        <div className="arrow-icon pending">
          <svg className="arrow-svg" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM9 9V6h2v3h3v2h-3v3H9v-3H6V9h3z" />
          </svg>
        </div>
      );
    }

    if (status === 'failed') {
      return (
        <div className="arrow-icon failed">
          <svg className="arrow-svg" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
          </svg>
        </div>
      );
    }

    if (amount > 0 || type === 'refund') {
      return (
        <div className="arrow-icon positive">
          <svg className="arrow-svg" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 18L17 11h-4V2H7v9H3L10 18z" />
          </svg>
        </div>
      );
    } else {
      return (
        <div className="arrow-icon negative">
          <svg className="arrow-svg" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2L3 9h4v9h6V9h4L10 2z" />
          </svg>
        </div>
      );
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const isSameDay = (date1, date2) => {
      return date1.getDate() === date2.getDate() &&
             date1.getMonth() === date2.getMonth() &&
             date1.getFullYear() === date2.getFullYear();
    };

    const timeStr = date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    if (isSameDay(date, today)) {
      return `Hôm nay, ${timeStr}`;
    } else if (isSameDay(date, yesterday)) {
      return `Hôm qua, ${timeStr}`;
    } else {
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const getTransactionTypeDisplay = (type) => {
    switch (type) {
      case 'deposit': return 'Nạp tiền';
      case 'purchase': return 'Mua hàng';
      case 'refund': return 'Hoàn tiền';
      case 'shop_upgrade': return 'Nâng cấp Shop';
      case 'premium_upgrade': return 'Nâng cấp Premium';
      case 'withdrawal': return 'Rút tiền';
      default: return type;
    }
  };

  const getStatusDisplay = (status) => {
    switch (status) {
      case 'completed': return 'Hoàn thành';
      case 'pending': return 'Đang chờ';
      case 'failed': return 'Thất bại';
      case 'refunded': return 'Đã hoàn tiền';
      default: return status;
    }
  };

  // Tính toán phân trang
  const paginatedTransactions = transactions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(transactions.length / itemsPerPage);

  // Sửa groupTransactionsByDate để dùng paginatedTransactions thay vì transactions
  const groupTransactionsByDate = () => {
    const groups = {};
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (!Array.isArray(paginatedTransactions)) return groups;

    paginatedTransactions.forEach(transaction => {
      const date = new Date(transaction.createdAt);
      const isSameDay = (date1, date2) => {
        return date1.getDate() === date2.getDate() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getFullYear() === date2.getFullYear();
      };

      let groupKey;
      if (isSameDay(date, today)) {
        groupKey = 'Hôm nay';
      } else if (isSameDay(date, yesterday)) {
        groupKey = 'Hôm qua';
      } else {
        groupKey = date.toLocaleDateString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(transaction);
    });

    return groups;
  };

  const formatPageDate = () => {
    const today = new Date();
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return today.toLocaleDateString('vi-VN', options).toUpperCase();
  };

  const formatBalance = (balance) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(balance || 0);
  };

  // Helper function to get user account type display
  const getUserAccountTypeDisplay = () => {
    if (!user) return 'Customer';
    
    if (hasRole('admin')) {
      return 'Administrator';
    }
    
    if (user.account_type?.type === 2) {
      return 'Premium User';
    }

    if (user.account_type?.type === 1) {
      return 'Pro User';
    }
    
    return 'Common User';
  };

  // Helper function to check if user should see upgrade option
  const shouldShowUpgrade = () => {
    if (!user) return false;
    
    // Don't show upgrade for admin
    if (hasRole('admin')) return false;
    
    // Don't show upgrade if already shop or premium
    if (user.account_type?.type === 'shop') return false;
    if (user.account_type?.level === 'premium') return false;
    
    return true;
  };

  // Check if user is shop
  const isShop = () => {
    return user?.account_type?.type === 'shop';
  };

  if (!user) {
    return (
      <>
        <Header />
        <div className="profile-layout">
          <NavigationBar />
          <div className="profile-container">
            <div className="welcome-header">
              <div className="welcome-content">
                <h1>Vui lòng đăng nhập</h1>
                <p>Bạn cần đăng nhập để xem lịch sử giao dịch</p>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const groupedTransactions = groupTransactionsByDate();

  return (
    <>
      <Header />
      <div className="profile-layout">
        <NavigationBar />
        
        <div className="profile-container">
          {/* Welcome Header */}
          <div className="welcome-header">
            <div className="welcome-content">
              <h1>Xin chào, {user.fullname || user.username}</h1>
              <p>{formatPageDate()}</p>
            </div>
            <div className="welcome-emoji">
              🐢
            </div>
          </div>

          {/* Profile Section */}
          <div className="profile-section">
            {/* Profile Header */}
            <div className="profile-header">
              <div className="profile-user-info">
                <div className="profile-avatar">
                  <img
                    src={user.user_imageurl || "/api/placeholder/64/64"}
                    alt="Profile"
                  />
                </div>
                <div className="profile-user-details">
                  <h2>{user.username}</h2>
                  {shouldShowUpgrade() ? (
                    <Link to="/PlanUpgrade" className="profile-badge-container">
                      <span className="profile-badge-text">{getUserAccountTypeDisplay()}</span>
                      <span className="upgrade-button">Upgrade account</span>
                    </Link>
                  ) : (
                    <div className="profile-badge-container">
                      <span className="profile-badge-text">{getUserAccountTypeDisplay()}</span>
                      {isShop() && (
                        <span className="shop-features-link">
                          <Link to="/ProductManagement">Quản lý cửa hàng</Link>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Balance Section */}
            <div className="balance-section">
              <h2 className="balance-title">
                Số dư tài khoản: <span className="balance-amount">{formatBalance(user.wallet?.balance)}</span>
              </h2>
            </div>

            {/* Transaction Content */}
            <div className="transaction-content">
              {/* Left Column - User Information */}
              <div className="billing-section">
                <h3 className="section-title">Thông tin tài khoản</h3>
                <div className="billing-info">
                  <div className="billing-item name-item">
                    <span className="billing-name">{user.fullname || user.username}</span>
                  </div>
                  <div className="billing-item">
                    <span className="billing-label">Email:</span>
                    <span className="billing-value">{user.email}</span>
                  </div>
                  <div className="billing-item">
                    <span className="billing-label">Số điện thoại:</span>
                    <span className="billing-value">{user.phone_number || 'Chưa cập nhật'}</span>
                  </div>
                  <div className="billing-item">
                    <span className="billing-label">Địa chỉ:</span>
                    <span className="billing-value">{user.address || 'Chưa cập nhật'}</span>
                  </div>
                  <div className="billing-item">
                    <span className="billing-label">Loại tài khoản:</span>
                    <span className="billing-value">
                      {getUserAccountTypeDisplay()}
                    </span>
                  </div>
                  {isShop() && user.account_type?.expires_at && (
                    <div className="billing-item">
                      <span className="billing-label">Hết hạn:</span>
                      <span className="billing-value">
                        {new Date(user.account_type.expires_at).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Transactions */}
              <div className="transactions-section">
                <div className="transactions-header">
                  <h3 className="section-title">Lịch sử giao dịch</h3>
                  <div className="date-range">
                    <span className="calendar-icon">📅</span>
                    <select 
                      value={dateRange} 
                      onChange={(e) => setDateRange(e.target.value)}
                      style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '14px',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="7">7 ngày qua</option>
                      <option value="30">30 ngày qua</option>
                      <option value="90">3 tháng qua</option>
                      <option value="365">1 năm qua</option>
                    </select>
                  </div>
                </div>

                <div className="transactions-list">
                  {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                      <div className="loading-spinner" style={{ 
                        width: '40px', 
                        height: '40px', 
                        border: '4px solid #f3f3f3',
                        borderTop: '4px solid #3498db',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 16px'
                      }}></div>
                      Đang tải giao dịch...
                    </div>
                  ) : error ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#dc3545' }}>
                      <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
                      {error}
                      <button 
                        onClick={fetchTransactions}
                        style={{
                          marginTop: '16px',
                          padding: '8px 16px',
                          backgroundColor: '#007bff',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Thử lại
                      </button>
                    </div>
                  ) : Object.keys(groupedTransactions).length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                      <div style={{ fontSize: '48px', marginBottom: '16px' }}>💳</div>
                      <h4>Chưa có giao dịch nào</h4>
                      <p>Lịch sử giao dịch của bạn sẽ được hiển thị ở đây</p>
                    </div>
                  ) : (
                    Object.entries(groupedTransactions).map(([dateGroup, dayTransactions]) => (
                      <div key={dateGroup} className="transaction-group">
                        <h4 className="group-title">{dateGroup.toUpperCase()}</h4>
                        {dayTransactions.map(transaction => (
                          <div key={transaction._id} className="transaction-item">
                            <div className="transaction-icon">
                              {getTransactionIcon(transaction.transaction_type, transaction.amount, transaction.status)}
                            </div>
                            <div className="transaction-details">
                              <div className="company-name">
                                {getTransactionTypeDisplay(transaction.transaction_type)}
                              </div>
                              <div className="transaction-description">
                                {transaction.description || 'Không có mô tả'}
                              </div>
                              <div className="transaction-date">
                                {formatDate(transaction.createdAt)}
                              </div>
                              <div className="transaction-status">
                                Trạng thái: {getStatusDisplay(transaction.status)}
                              </div>
                            </div>
                            <div className={`transaction-amount ${getAmountClass(transaction.amount, transaction.status)}`}>
                              {transaction.status === 'paid' ? (
                                <div>
                                  <div>Đang xử lý</div>
                                  <div style={{ fontSize: '12px', opacity: 0.7 }}>
                                    {formatAmount(transaction.amount)}
                                  </div>
                                </div>
                              ) : transaction.status === 'cancelled' ? (
                                <div>
                                  <div>Thất bại</div>
                                  <div style={{ fontSize: '12px', opacity: 0.7 }}>
                                    {formatAmount(transaction.amount)}
                                  </div>
                                </div>
                              ) : (
                                formatAmount(transaction.amount)
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ))
                  )}
                </div>
                {/* Pagination controls */}
                {totalPages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      style={{ marginRight: 8, padding: '6px 12px', borderRadius: 4, border: '1px solid #ccc', background: currentPage === 1 ? '#eee' : '#fff', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                    >
                      Trang trước
                    </button>
                    <span style={{ lineHeight: '32px', margin: '0 12px' }}>
                      Trang {currentPage} / {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      style={{ marginLeft: 8, padding: '6px 12px', borderRadius: 4, border: '1px solid #ccc', background: currentPage === totalPages ? '#eee' : '#fff', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                    >
                      Trang sau
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .transaction-item .transaction-amount.cancelled {
          color: #dc3545;
        }
        
        .arrow-icon.cancelled {
          background-color: #dc3545;
          color: white;
        }
      `}</style>
      
      <Footer />
    </>
  );
};

export default Transaction;