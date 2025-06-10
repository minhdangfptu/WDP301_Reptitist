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
    <div className="plan-modal-overlay" onClick={onClose}>
      <div className="plan-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Background Image */}
        <div className="plan-modal-bg-image"></div>
        
        <div className="plan-modal-content">
          {/* Left Section - Plan Selection */}
          <div className="plan-modal-left-section">
            <div className="plan-modal-header">
              <button className="plan-modal-back-button" onClick={onClose}>
                Chọn gói
              </button>
              
              <div className="plan-modal-tabs">
                <button 
                  className={`plan-modal-tab ${selectedPeriod === 'monthly' ? 'active' : ''}`}
                  onClick={() => setSelectedPeriod('monthly')}
                >
                  Định kỳ
                </button>
                <button 
                  className={`plan-modal-tab ${selectedPeriod === 'yearly' ? 'active' : ''}`}
                  onClick={() => setSelectedPeriod('yearly')}
                >
                  Một lần
                </button>
              </div>
            </div>

            <div className="plan-modal-features">
              <div className="plan-modal-feature">
                <div className="plan-modal-feature-icon"></div>
                <div className="plan-modal-feature-text">7 ngày dùng thử miễn phí, hủy bất cứ lúc nào</div>
              </div>
              <div className="plan-modal-feature">
                <div className="plan-modal-feature-icon"></div>
                <div className="plan-modal-feature-text">Chúng tôi sẽ thông báo đến bạn trước khi hết hạn dùng thử</div>
              </div>
            </div>

            <div className="plan-modal-pricing-cards">
              <div 
                className={`plan-modal-pricing-card ${selectedPeriod === 'monthly' ? 'selected' : ''}`}
                onClick={() => setSelectedPeriod('monthly')}
              >
                <div className="plan-modal-radio-wrapper">
                  <div className="plan-modal-radio"></div>
                </div>
                <div className="plan-modal-plan-info">
                  <div className="plan-modal-plan-name">Hàng tháng</div>
                  <div className="plan-modal-plan-price">{formatPrice(planData.price)} đ</div>
                  <div className="plan-modal-plan-duration">({formatPrice(Math.round(planData.price / 30))} đ/ngày)</div>
                </div>
              </div>

              <div 
                className={`plan-modal-pricing-card ${selectedPeriod === 'yearly' ? 'selected' : ''}`}
                onClick={() => setSelectedPeriod('yearly')}
              >
                <div className="plan-modal-radio-wrapper">
                  <div className="plan-modal-radio"></div>
                </div>
                <div className="plan-modal-plan-info">
                  <div className="plan-modal-plan-name">Hàng năm</div>
                  <div className="plan-modal-plan-price">
                    {formatPrice(planData.oneTimePrice)} đ
                    {getSavingsPercent() > 0 && (
                      <span style={{
                        marginLeft: '8px',
                        fontSize: '12px',
                        background: 'linear-gradient(135deg, #48bb78, #38a169)',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontWeight: '600'
                      }}>
                        Tiết kiệm {getSavingsPercent()}%
                      </span>
                    )}
                  </div>
                  <div className="plan-modal-plan-duration">({formatPrice(Math.round(planData.oneTimePrice / 365))} đ/ngày)</div>
                </div>
              </div>
            </div>

            <div className="plan-modal-billing-info">
              <div className="plan-modal-billing-row">
                <span className="plan-modal-billing-label">Thanh toán vào {formatDate(expiryDate)}</span>
                <span className="plan-modal-billing-value">{formatPrice(getCurrentPrice())} đ</span>
              </div>
              <div className="plan-modal-billing-row">
                <span className="plan-modal-billing-label">
                  Thanh toán hôm nay <span className="plan-modal-free-trial">(7 ngày dùng thử miễn phí)</span>
                </span>
                <span className="plan-modal-billing-value">0 đ</span>
              </div>
            </div>

            <button className="plan-modal-cta-button" onClick={handlePurchaseClick}>
              Tiếp tục
            </button>
          </div>

          {/* Right Section - Timeline */}
          <div className="plan-modal-right-section">
            <div className="plan-modal-timeline-header">
              <div className="plan-modal-timeline-title">Thời gian đăng ký</div>
              <div className="plan-modal-timeline-subtitle">Theo dõi quá trình đăng ký của bạn</div>
            </div>

            <div className="plan-modal-timeline">
              {/* Subscription Date */}
              <div className="plan-modal-timeline-item active">
                <div className="plan-modal-timeline-icon">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm3.78-9.72a.75.75 0 0 0-1.06-1.06L6.75 9.19 5.28 7.72a.75.75 0 0 0-1.06 1.06l2 2a.75.75 0 0 0 1.06 0l4.5-4.5z"/>
                  </svg>
                </div>
                <div className="plan-modal-timeline-content">
                  <div className="plan-modal-timeline-date">{formatDate(subscriptionDate)}</div>
                  <div className="plan-modal-timeline-label">Ngày đăng ký</div>
                  <div className="plan-modal-timeline-description">Gói dịch vụ được kích hoạt</div>
                </div>
              </div>

              {/* Notification Date */}
              <div className="plan-modal-timeline-item pending">
                <div className="plan-modal-timeline-icon">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zM8 1.918l-.797.161A4.002 4.002 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4.002 4.002 0 0 0-3.203-3.92L8 1.917zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5.002 5.002 0 0 1 13 6c0 .88.32 4.2 1.22 6z"/>
                  </svg>
                </div>
                <div className="plan-modal-timeline-content">
                  <div className="plan-modal-timeline-date">{formatDate(notificationDate)}</div>
                  <div className="plan-modal-timeline-label">Thông báo hết hạn</div>
                  <div className="plan-modal-timeline-description">Nhắc nhở trước 2 ngày</div>
                </div>
              </div>

              {/* Expiry Date */}
              <div className="plan-modal-timeline-item future">
                <div className="plan-modal-timeline-icon">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                    <path d="M7.5 3a.5.5 0 0 1 .5.5v5.21l3.248 1.856a.5.5 0 0 1-.496.868l-3.5-2A.5.5 0 0 1 7 9V3.5a.5.5 0 0 1 .5-.5z"/>
                  </svg>
                </div>
                <div className="plan-modal-timeline-content">
                  <div className="plan-modal-timeline-date">{formatDate(expiryDate)}</div>
                  <div className="plan-modal-timeline-label">Ngày hết hạn</div>
                  <div className="plan-modal-timeline-description">Gói dịch vụ hết hiệu lực</div>
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