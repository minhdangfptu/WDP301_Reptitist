import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { baseUrl } from '../config';
import '../css/AdminIncomeManagement.css';

const AdminIncomeManagement = () => {
  const { user, hasRole } = useAuth();
  const [incomeData, setIncomeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter states
  const [period, setPeriod] = useState('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (user && hasRole('admin')) {
      fetchIncomeData();
    }
  }, [user]);

  const fetchIncomeData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('refresh_token');
      if (!token) {
        setError('Phiên đăng nhập đã hết hạn');
        return;
      }

      const params = new URLSearchParams();
      params.append('period', period);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      console.log('Fetching income data from:', `${baseUrl}/reptitist/admin/income?${params}`);
      
      const response = await axios.get(`${baseUrl}/reptitist/admin/income?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      console.log('Income data received:', response.data);
      setIncomeData(response.data);
    } catch (err) {
      console.error('Error fetching income data:', err);
      setError('Không thể tải dữ liệu doanh thu: ' + (err.response?.data?.message || err.message));
      setIncomeData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchIncomeData();
  };

  const handleResetFilters = () => {
    setPeriod('month');
    setStartDate('');
    setEndDate('');
    // Fetch data with default filters
    setTimeout(() => fetchIncomeData(), 100);
  };

  const formatCurrency = (amount) => {
    if (typeof amount !== 'number') return '0 VNĐ';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const getPeriodLabel = (periodType) => {
    switch (periodType) {
      case 'day': return 'Ngày';
      case 'week': return 'Tuần';
      case 'month': return 'Tháng';
      case 'year': return 'Năm';
      default: return periodType;
    }
  };

  if (!hasRole('admin')) {
    return (
      <>
        <Header />
        <div className="admin-income-management">
          <div className="im-error-state">
            <i className="fas fa-exclamation-triangle"></i>
            <h3>Không có quyền truy cập</h3>
            <p>Bạn không có quyền truy cập trang này.</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="admin-income-management">
        {/* Page Header */}
        <div className="im-page-header">
          <div className="im-page-header-content">
            <div className="im-page-header-text">
              <h1>
                <i className="fas fa-chart-line"></i>
                Thống kê doanh thu
              </h1>
              <p>Phân tích doanh thu theo từng mốc thời gian</p>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="im-filters-section">
          <form onSubmit={handleFilterSubmit}>
            <div className="im-filters-row">
              <div className="im-filter-group">
                <label className="im-filter-label">Khoảng thời gian:</label>
                <select 
                  className="im-filter-select" 
                  value={period} 
                  onChange={e => setPeriod(e.target.value)}
                >
                  <option value="day">Theo ngày</option>
                  <option value="week">Theo tuần</option>
                  <option value="month">Theo tháng</option>
                  <option value="year">Theo năm</option>
                </select>
              </div>
              
              <div className="im-filter-group">
                <label className="im-filter-label">Từ ngày:</label>
                <input
                  type="date"
                  className="im-filter-input"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                />
              </div>
              
              <div className="im-filter-group">
                <label className="im-filter-label">Đến ngày:</label>
                <input
                  type="date"
                  className="im-filter-input"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                />
              </div>
              
              <button type="submit" className="im-filter-button">
                <i className="fas fa-search"></i>
                Lọc dữ liệu
              </button>
              
              <button type="button" className="im-reset-button" onClick={handleResetFilters}>
                <i className="fas fa-undo"></i>
                Đặt lại
              </button>
            </div>
          </form>
        </div>

        {loading ? (
          <div className="im-loading-state">
            <div className="im-spinner"></div>
            <h3>Đang tải dữ liệu...</h3>
            <p>Vui lòng chờ trong giây lát</p>
          </div>
        ) : error ? (
          <div className="im-error-state">
            <i className="fas fa-exclamation-triangle"></i>
            <h3>Lỗi tải dữ liệu</h3>
            <p>{error}</p>
            <button className="im-filter-button" onClick={fetchIncomeData}>
              <i className="fas fa-redo"></i>
              Thử lại
            </button>
          </div>
        ) : incomeData ? (
          <>
            {/* Summary Cards */}
            <div className="im-summary-section">
              <div className="im-summary-grid">
                <div className="im-summary-card im-card-revenue">
                  <div className="im-summary-content">
                    <div className="im-summary-icon">
                      <i className="fas fa-dollar-sign"></i>
                    </div>
                    <div className="im-summary-text">
                      <span className="im-summary-number">
                        {formatCurrency(incomeData.summary?.totalRevenue || 0)}
                      </span>
                      <span className="im-summary-label">Tổng doanh thu</span>
                      <span className="im-summary-change">
                        {incomeData.summary?.periodCount || 0} {getPeriodLabel(period)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="im-summary-card im-card-transactions">
                  <div className="im-summary-content">
                    <div className="im-summary-icon">
                      <i className="fas fa-shopping-cart"></i>
                    </div>
                    <div className="im-summary-text">
                      <span className="im-summary-number">
                        {incomeData.summary?.totalTransactions || 0}
                      </span>
                      <span className="im-summary-label">Tổng giao dịch</span>
                      <span className="im-summary-change">
                        Giao dịch thành công
                      </span>
                    </div>
                  </div>
                </div>

                <div className="im-summary-card im-card-average">
                  <div className="im-summary-content">
                    <div className="im-summary-icon">
                      <i className="fas fa-chart-bar"></i>
                    </div>
                    <div className="im-summary-text">
                      <span className="im-summary-number">
                        {formatCurrency(incomeData.summary?.averageRevenue || 0)}
                      </span>
                      <span className="im-summary-label">Trung bình/giao dịch</span>
                      <span className="im-summary-change">
                        Trung bình
                      </span>
                    </div>
                  </div>
                </div>

                <div className="im-summary-card im-card-periods">
                  <div className="im-summary-content">
                    <div className="im-summary-icon">
                      <i className="fas fa-calendar-alt"></i>
                    </div>
                    <div className="im-summary-text">
                      <span className="im-summary-number">
                        {incomeData.summary?.periodCount || 0}
                      </span>
                      <span className="im-summary-label">Số {getPeriodLabel(period)}</span>
                      <span className="im-summary-change">
                        Có dữ liệu
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Table */}
            <div className="im-table-section">
              <div>
                <h2>
                  <i className="fas fa-table"></i>
                  Chi tiết doanh thu theo {getPeriodLabel(period).toLowerCase()}
                </h2>
                <div style={{ overflowX: 'auto' }}>
                  <table className="im-income-table">
                    <thead>
                      <tr>
                        <th>Thời gian</th>
                        <th>Loại</th>
                        <th>Doanh thu</th>
                        <th>Số giao dịch</th>
                        <th>Trung bình/giao dịch</th>
                      </tr>
                    </thead>
                    <tbody>
                      {incomeData.data && incomeData.data.length > 0 ? (
                        incomeData.data.map((item, index) => (
                          <tr key={index}>
                            <td>
                              <strong>{item.period}</strong>
                              <br />
                              <small>{formatDate(item.date)}</small>
                            </td>
                            <td>
                              <span className={`im-period-badge im-badge-${item.periodType}`}>
                                {getPeriodLabel(item.periodType)}
                              </span>
                            </td>
                            <td>
                              <strong>{formatCurrency(item.revenue)}</strong>
                            </td>
                            <td>{item.transactionCount}</td>
                            <td>{formatCurrency(item.averageTransaction)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
                            <i className="fas fa-inbox" style={{ fontSize: '2rem', color: '#ccc', marginBottom: '1rem' }}></i>
                            <p>Không có dữ liệu doanh thu</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Top Periods */}
            {incomeData.topPeriods && incomeData.topPeriods.length > 0 && (
              <div className="im-top-periods">
                <h2>
                  <i className="fas fa-trophy"></i>
                  Top {getPeriodLabel(period).toLowerCase()} có doanh thu cao nhất
                </h2>
                <div className="im-top-periods-grid">
                  {incomeData.topPeriods.map((period, index) => (
                    <div key={index} className="im-top-period-card">
                      <div className="im-top-period-header">
                        <span className="im-top-period-rank">#{index + 1}</span>
                        <span className="im-top-period-label">{period.period}</span>
                      </div>
                      <div className="im-top-period-revenue">
                        {formatCurrency(period.revenue)}
                      </div>
                      <div className="im-top-period-stats">
                        <span>{period.transactionCount} giao dịch</span>
                        <span>TB: {formatCurrency(period.averageTransaction)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="im-error-state">
            <i className="fas fa-exclamation-triangle"></i>
            <h3>Không có dữ liệu</h3>
            <p>Không tìm thấy dữ liệu doanh thu.</p>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default AdminIncomeManagement; 