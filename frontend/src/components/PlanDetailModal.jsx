// PlanDetailModal.jsx
import React, { useState } from 'react';
import '../css/PlanDetailModal.css';

const PlanDetailModal = ({ isOpen, onClose, planData, onPurchase }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly'); // 'monthly' or 'yearly'

  if (!isOpen || !planData) return null;

  // Calculate dates
  const today = new Date();
  const subscriptionDate = today;
  
  // Calculate expiry date based on selected period
  const expiryDate = new Date(today);
  if (selectedPeriod === 'monthly') {
    expiryDate.setMonth(expiryDate.getMonth() + 1);
  } else {
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
  }
  
  // Calculate notification date (2 days before expiry)
  const notificationDate = new Date(expiryDate);
  notificationDate.setDate(notificationDate.getDate() - 2);

  const formatDate = (date) => {
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const getCurrentPrice = () => {
    return selectedPeriod === 'monthly' ? planData.price : planData.oneTimePrice;
  };

  const getCurrentPeriodText = () => {
    return selectedPeriod === 'monthly' ? 'hàng tháng' : 'hàng năm';
  };

  const getSavingsPercent = () => {
    if (selectedPeriod === 'yearly' && planData.price && planData.oneTimePrice) {
      const monthlyYearly = planData.price * 12;
      const oneTime = planData.oneTimePrice;
      return Math.round(((monthlyYearly - oneTime) / monthlyYearly) * 100);
    }
    return 0;
  };

  const handlePurchaseClick = () => {
    if (onPurchase) {
      onPurchase({
        period: selectedPeriod,
        price: getCurrentPrice(),
        planName: planData.name
      });
    }
  };

  return (
    <div className="plan-detail-overlay" onClick={onClose}>
      <div className="plan-detail-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="plan-detail-header">
          <h2>Chi tiết gói {planData.name}</h2>
          <button className="plan-detail-close" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="plan-detail-content">
          {/* Left Column - Selection & Content */}
          <div className="plan-detail-left">
            {/* Period Selection */}
            <div className="period-selection">
              <h3>Chọn chu kỳ thanh toán</h3>
              <div className="period-buttons">
                <button 
                  className={`period-btn ${selectedPeriod === 'monthly' ? 'active' : ''}`}
                  onClick={() => setSelectedPeriod('monthly')}
                >
                  <div className="period-btn-content">
                    <span className="period-title">Định kỳ</span>
                    <span className="period-subtitle">Thanh toán hàng tháng</span>
                    <span className="period-price">đ{formatPrice(planData.price)}/tháng</span>
                  </div>
                </button>
                
                <button 
                  className={`period-btn ${selectedPeriod === 'yearly' ? 'active' : ''}`}
                  onClick={() => setSelectedPeriod('yearly')}
                >
                  <div className="period-btn-content">
                    <span className="period-title">1 lần</span>
                    <span className="period-subtitle">Thanh toán 1 lần cho cả năm</span>
                    <span className="period-price">
                      đ{formatPrice(planData.oneTimePrice)}/năm
                      {getSavingsPercent() > 0 && (
                        <span className="savings-badge">Tiết kiệm {getSavingsPercent()}%</span>
                      )}
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* Options */}
            <div className="plan-options">
              <h3>Tùy chọn bổ sung</h3>
              <div className="option-item">
                <label className="option-checkbox">
                  <input type="checkbox" />
                  <span className="checkmark"></span>
                  <span className="option-text">Tự động gia hạn khi hết hạn</span>
                </label>
              </div>
              <div className="option-item">
                <label className="option-checkbox">
                  <input type="checkbox" />
                  <span className="checkmark"></span>
                  <span className="option-text">Nhận thông báo qua email</span>
                </label>
              </div>
            </div>

            {/* Continue Button */}
            <button className="continue-btn" onClick={handlePurchaseClick}>
              <span>Tiếp tục với {planData.name} - đ{formatPrice(getCurrentPrice())}/{selectedPeriod === 'monthly' ? 'tháng' : 'năm'}</span>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/>
              </svg>
            </button>
          </div>

          {/* Right Column - Subscription Timeline */}
          <div className="plan-detail-right">
            {/* Column 1: Timeline Information */}
            <div className="timeline-column">
              <h3>Thời gian đăng ký</h3>
              
              {/* Timeline */}
              <div className="timeline">
                {/* Subscription Date */}
                <div className="timeline-item">
                  <div className="timeline-marker subscription">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm3.78-9.72a.75.75 0 0 0-1.06-1.06L6.75 9.19 5.28 7.72a.75.75 0 0 0-1.06 1.06l2 2a.75.75 0 0 0 1.06 0l4.5-4.5z"/>
                    </svg>
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-date">{formatDate(subscriptionDate)}</div>
                    <div className="timeline-label">Ngày đăng ký</div>
                    <div className="timeline-desc">Gói dịch vụ được kích hoạt</div>
                  </div>
                </div>

                {/* Notification Date */}
                <div className="timeline-item">
                  <div className="timeline-marker notification">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zM8 1.918l-.797.161A4.002 4.002 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4.002 4.002 0 0 0-3.203-3.92L8 1.917zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5.002 5.002 0 0 1 13 6c0 .88.32 4.2 1.22 6z"/>
                    </svg>
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-date">{formatDate(notificationDate)}</div>
                    <div className="timeline-label">Thông báo hết hạn</div>
                    <div className="timeline-desc">Nhắc nhở trước 2 ngày</div>
                  </div>
                </div>

                {/* Expiry Date */}
                <div className="timeline-item">
                  <div className="timeline-marker expiry">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                      <path d="M7.5 3a.5.5 0 0 1 .5.5v5.21l3.248 1.856a.5.5 0 0 1-.496.868l-3.5-2A.5.5 0 0 1 7 9V3.5a.5.5 0 0 1 .5-.5z"/>
                    </svg>
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-date">{formatDate(expiryDate)}</div>
                    <div className="timeline-label">Ngày hết hạn</div>
                    <div className="timeline-desc">Gói dịch vụ hết hiệu lực</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanDetailModal;