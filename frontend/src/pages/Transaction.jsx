import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import NavigationBar from '../components/NavigationBar';
import '../css/Transaction.css';

const Transaction = () => {
  const transactions = [
    {
      id: 1,
      type: 'newest',
      company: 'Netflix',
      date: '27 March 2020, at 12:30 PM',
      amount: -2500,
      status: 'completed'
    },
    {
      id: 2,
      type: 'newest',
      company: 'Apple',
      date: '27 March 2020, at 12:00 PM',
      amount: +25000,
      status: 'completed'
    },
    {
      id: 3,
      type: 'yesterday',
      company: 'Stripe',
      date: '26 March 2020, at 13:45 PM',
      amount: +5000,
      status: 'completed'
    },
    {
      id: 4,
      type: 'yesterday',
      company: 'HubSpot',
      date: '26 March 2020, at 12:30 PM',
      amount: +17700,
      status: 'completed'
    },
    {
      id: 5,
      type: 'yesterday',
      company: 'Webflow',
      date: '26 March 2020, at 05:00 AM',
      amount: 0,
      status: 'pending'
    },
    {
      id: 6,
      type: 'yesterday',
      company: 'Microsoft',
      date: '25 March 2020, at 16:30 PM',
      amount: -987,
      status: 'completed'
    }
  ];

  const formatAmount = (amount) => {
    if (amount > 0) return `+$${amount}`;
    if (amount < 0) return `-$${Math.abs(amount)}`;
    return 'Pending';
  };

  const getAmountClass = (amount, status) => {
    if (status === 'pending') return 'pending';
    return amount > 0 ? 'positive' : 'negative';
  };

  return (
    <>
      <Header />
      <div className="profile-layout">
        <NavigationBar />
        
        <div className="profile-container">
          {/* Welcome Header */}
          <div className="welcome-header">
            <div className="welcome-content">
              <h1>Xin chào, Minh Đăng</h1>
              <p>THỨ 3, 20/05/2025</p>
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
                    src="/api/placeholder/64/64"
                    alt="Profile"
                  />
                </div>
                <div className="profile-user-details">
                  <h2>mangdinh_buonngu</h2>
                  <div className="profile-badge-container">
                    <span className="profile-badge-text">Premium Customer</span>
                    <button className="upgrade-button">
                      Upgrade account
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Balance Section */}
            <div className="balance-section">
              <h2 className="balance-title">
                Số dư tài khoản: <span className="balance-amount">0 VND</span>
              </h2>
            </div>

            {/* Transaction Content */}
            <div className="transaction-content">
              {/* Left Column - Billing Information */}
              <div className="billing-section">
                <h3 className="section-title">Billing Information</h3>
                <div className="billing-info">
                  <div className="billing-item">
                    <span className="billing-value">Oliver Liam</span>
                  </div>
                  <div className="billing-item">
                    <span className="billing-label">Company Name:</span>
                    <span className="billing-value">Viking Burrito</span>
                  </div>
                  <div className="billing-item">
                    <span className="billing-label">Email Address:</span>
                    <span className="billing-value">oliver@burrito.com</span>
                  </div>
                  <div className="billing-item">
                    <span className="billing-label">VAT Number:</span>
                    <span className="billing-value">FRB1235476</span>
                  </div>
                </div>
              </div>

              {/* Right Column - Your Transactions */}
              <div className="transactions-section">
                <div className="transactions-header">
                  <h3 className="section-title">Your Transactions</h3>
                  <div className="date-range">
                    <span className="calendar-icon">📅</span>
                    <span>23 - 30 March 2020</span>
                  </div>
                </div>

                <div className="transactions-list">
                  {/* NEWEST */}
                  <div className="transaction-group">
                    <h4 className="group-title">NEWEST</h4>
                    {transactions.filter(t => t.type === 'newest').map(transaction => (
                      <div key={transaction.id} className="transaction-item">
                        <div className="transaction-icon">
                          <div className={`company-icon ${transaction.company.toLowerCase()}`}>
                            {transaction.company.charAt(0)}
                          </div>
                        </div>
                        <div className="transaction-details">
                          <div className="company-name">{transaction.company}</div>
                          <div className="transaction-date">{transaction.date}</div>
                        </div>
                        <div className={`transaction-amount ${getAmountClass(transaction.amount, transaction.status)}`}>
                          {formatAmount(transaction.amount)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* YESTERDAY */}
                  <div className="transaction-group">
                    <h4 className="group-title">YESTERDAY</h4>
                    {transactions.filter(t => t.type === 'yesterday').map(transaction => (
                      <div key={transaction.id} className="transaction-item">
                        <div className="transaction-icon">
                          <div className={`company-icon ${transaction.company.toLowerCase()}`}>
                            {transaction.company.charAt(0)}
                          </div>
                        </div>
                        <div className="transaction-details">
                          <div className="company-name">{transaction.company}</div>
                          <div className="transaction-date">{transaction.date}</div>
                        </div>
                        <div className={`transaction-amount ${getAmountClass(transaction.amount, transaction.status)}`}>
                          {formatAmount(transaction.amount)}
                        </div>
                      </div>
                    ))}
                  </div>
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