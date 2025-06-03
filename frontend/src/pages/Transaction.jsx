import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import NavigationBar from '../components/NavigationBar';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import '../css/Transaction.css';

const Transaction = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState('30days');

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user, dateRange]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:8080/reptitist/transactions?range=${dateRange}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      setTransactions(response.data.transactions || []);
      setError('');
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Không thể tải lịch sử giao dịch');
      // Set mock data for demo if API fails
      setTransactions(getMockTransactions());
    } finally {
      setLoading(false);
    }
  };

  const getMockTransactions = () => [
    {
      _id: '1',
      transaction_type: 'deposit',
      amount: 100000,
      description: 'Nạp tiền vào ví',
      status: 'completed',
      transaction_date: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
    },
    {
      _id: '2',
      transaction_type: 'purchase',
      amount: -50000,
      description: 'Mua thức ăn cho bò sát',
      status: 'completed',
      transaction_date: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 day ago
    },
    {
      _id: '3',
      transaction_type: 'refund',
      amount: 25000,
      description: 'Hoàn tiền đơn hàng #12345',
      status: 'completed',
      transaction_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2) // 2 days ago
    },
    {
      _id: '4',
      transaction_type: 'purchase',
      amount: -75000,
      description: 'Thanh toán dịch vụ tư vấn',
      status: 'pending',
      transaction_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3) // 3 days ago
    }
  ];

  const formatAmount = (amount) => {
    const absAmount = Math.abs(amount);
    const formatted = new Intl.NumberFormat('vi-VN').format(absAmount);
    return amount > 0 ? `+${formatted} VND` : `-${formatted} VND`;
  };

  const getAmountClass = (amount, status) => {
    if (status === 'pending') return 'pending';
    return amount > 0 ? 'positive' : 'negative';
  };

  const getTransactionIcon = (type, amount, status) => {
    if (status === 'pending') {
      return (
        <div className="arrow-icon pending">
          <svg className="arrow-svg" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2L3 9h4v9h6V9h4L10 2z" />
          </svg>
        </div>
      );
    }

    if (amount > 0) {
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

  const groupTransactionsByDate = () => {
    const groups = {};
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    transactions.forEach(transaction => {
      const date = new Date(transaction.transaction_date);
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
                  <div className="profile-badge-container">
                    <span className="profile-badge-text">
                      {user.account_type?.type === 'premium' ? 'Premium Customer' : 'Customer'}
                    </span>
                    {user.account_type?.type !== 'premium' && (
                      <button className="upgrade-button">
                        Upgrade account
                      </button>
                    )}
                  </div>
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
                      {user.account_type?.type === 'premium' ? 'Premium' : 'Thường'}
                    </span>
                  </div>
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
                      <option value="7days">7 ngày qua</option>
                      <option value="30days">30 ngày qua</option>
                      <option value="90days">3 tháng qua</option>
                    </select>
                  </div>
                </div>

                <div className="transactions-list">
                  {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                      Đang tải...
                    </div>
                  ) : error ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#dc3545' }}>
                      {error}
                    </div>
                  ) : Object.keys(groupedTransactions).length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                      Không có giao dịch nào trong khoảng thời gian này
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
                                {transaction.description || transaction.transaction_type}
                              </div>
                              <div className="transaction-date">
                                {formatDate(transaction.transaction_date)}
                              </div>
                            </div>
                            <div className={`transaction-amount ${getAmountClass(transaction.amount, transaction.status)}`}>
                              {transaction.status === 'pending' ? 'Đang xử lý' : formatAmount(transaction.amount)}
                            </div>
                          </div>
                        ))}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Transaction;