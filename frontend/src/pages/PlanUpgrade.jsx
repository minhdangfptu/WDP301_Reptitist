// Cập nhật file PlanUpgrade.jsx gốc thay vì tạo mới
// File này sẽ thay thế nội dung trong pages/PlanUpgrade.jsx hiện tại

import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../css/PlanUpgrade.css';

const PlanUpgrade = () => {
  const [activeTab, setActiveTab] = useState('individual'); // 'individual' or 'partner'
  const { user } = useAuth();
  const navigate = useNavigate();

  const handlePlanSelect = (planKey, plan) => {
    if (plan.isCurrent) return;
    
    if (!user) {
      toast.info('Vui lòng đăng nhập để nâng cấp gói dịch vụ', {
        position: "top-right",
        autoClose: 3000,
        onClose: () => navigate('/Login')
      });
      return;
    }

    // Simulate plan selection
    toast.success(`Bạn đã chọn gói ${plan.name}. Chức năng thanh toán sẽ được cập nhật sớm!`, {
      position: "top-right",
      autoClose: 5000
    });
  };

  const individualPlans = {
    free: {
      name: 'Miễn phí',
      price: 0,
      period: 'VNĐ/tháng',
      description: 'Cùng khám phá sự hỗ trợ cơ bản của Reptitist trong chăm sóc bò sát của bạn hằng ngày',
      features: [
        'Tìm kiếm thông tin về bò sát',
        'Kết nối với cộng đồng bò sát',
        'Truy cập thư viện kiến thức có giới hạn',
        'Mua các sản phẩm chăm sóc bò sát',
        'Khám phá tin tức quan trọng về bò sát'
      ],
      buttonText: 'Kế hoạch hiện tại của bạn',
      buttonStyle: 'outline',
      isCurrent: true
    },
    premium: {
      name: 'Premium',
      price: 9000,
      period: 'VNĐ',
      description: 'Sử dụng Reptitist một cách năng suất và sáng tạo với quyền truy cập được mở rộng!',
      popular: true,
      features: [
        'Mọi thứ đều miễn phí',
        'Trợ lý ảo AI hỗ trợ 24/7',
        'Truy cập không giới hạn thư viện kiến thức',
        'Tìm kiếm chuyên sâu thông tin bò sát',
        'Kết nối nâng cao với cộng đồng',
        'Cá nhân hoá hồ sơ người dùng',
        'Cá nhân hoá hồ sơ bò sát',
        'Hệ sinh thái chăm sóc bò sát toàn diện',
        'Mua các sản phẩm chăm sóc bò sát',
        'Các công cụ hỗ trợ nhắc nhở và nhật ký'
      ],
      buttonText: 'Tìm hiểu chi tiết',
      buttonStyle: 'primary'
    }
  };

  const partnerPlans = {
    basic: {
      name: 'Gói cá bản',
      price: 199000,
      period: 'VNĐ/tháng',
      description: 'Tối ưu hoá hiệu quả kinh doanh nhỏ không gian làm việc của Reptitist.',
      features: [
        'Mọi tính năng của Gói Cá nhân',
        'Kết nối với cộng đồng bò sát rộng lớn',
        'Số lượng sản phẩm giới hạn',
        'Giải hạn thêm gia FLASH SALE',
        'Hỗ trợ khách hàng hàng đầu',
        'Thông kê báo cáo của hàng cơ bản'
      ],
      buttonText: 'Tìm hiểu chi tiết',
      buttonStyle: 'outline'
    },
    premium: {
      name: 'Gói Premium',
      price: 299000,
      period: 'VNĐ/tháng',
      description: 'Trải nghiệm mọi trường kinh doanh chăm sóc bò sát chuyên nghiệp.',
      popular: true,
      features: [
        'Mọi tính năng của Gói Cá nhân',
        'Kết nối với cộng đồng bò sát rộng lớn',
        'Số lượng sản phẩm KHÔNG giới hạn',
        'KHÔNG giới hạn FLASH SALE',
        'Hỗ trợ khách hàng ưu tiên',
        'Thông kê báo cáo của hàng đầy đủ',
        'Ưu tiên hiển thị trên trang chủ',
        'Đề xuất quảng cáo'
      ],
      buttonText: 'Tìm hiểu chi tiết',
      buttonStyle: 'primary'
    }
  };

  const currentPlans = activeTab === 'individual' ? individualPlans : partnerPlans;

  const formatPrice = (price) => {
    if (price === 0) return '0';
    return new Intl.NumberFormat('vi-VN').format(price);
  };

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
      <div className="plan-upgrade-page">
        <div className="plan-container">
          <div className="plan-upgrade-header">
            <h1 className="plan-upgrade-title">Nâng cấp gói của bạn</h1>
            <p className="plan-upgrade-subtitle">
              Bạn muốn trở thành đối tác của chúng tôi? Hãy tham khảo các gói dịch vụ sau
            </p>
          </div>

          {/* Tab Toggle */}
          <div className="plan-toggle">
            <button 
              className={`plan-toggle-btn ${activeTab === 'individual' ? 'active' : ''}`}
              onClick={() => setActiveTab('individual')}
            >
              Cá nhân
            </button>
            <button 
              className={`plan-toggle-btn ${activeTab === 'partner' ? 'active' : ''}`}
              onClick={() => setActiveTab('partner')}
            >
              Đối tác
            </button>
          </div>

          {/* Plans Grid */}
          <div className="plan-plans-container">
            <div className="plan-plans-grid">
              {Object.entries(currentPlans).map(([key, plan]) => (
                <div key={key} className={`plan-card ${plan.popular ? 'popular' : ''}`}>
                  {plan.popular && (
                    <div className="plan-popular-badge">Popular</div>
                  )}
                  
                  <div className="plan-content">
                    <div className="plan-header">
                      <h3 className="plan-name">{plan.name}</h3>
                      <div className="plan-pricing">
                        <span className="plan-currency">đ</span>
                        <span className="plan-price">{formatPrice(plan.price)}</span>
                        <span className="plan-period">{plan.period}</span>
                      </div>
                      <p className="plan-description">{plan.description}</p>
                    </div>

                    <button 
                      className={`plan-button ${plan.buttonStyle} ${plan.isCurrent ? 'current' : ''}`}
                      disabled={plan.isCurrent}
                      onClick={() => handlePlanSelect(key, plan)}
                    >
                      {plan.buttonText}
                    </button>

                    <div className="plan-features">
                      <ul className="plan-features-list">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="plan-feature-item">
                            <div className="plan-feature-content">
                              <svg className="plan-feature-icon" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              <span className="feature-text">{feature}</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="plan-footer">
                    <p className="plan-terms">
                      Bạn có thể hủy bỏi bất cứ lúc nào theo thuận hoa này đây
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Info */}
          <div className="plan-bottom-info">
            <div className="plan-info-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <p className="plan-info-text">
              Bạn cần tìm hiểu thêm về các gói dịch vụ nâng cao?<br/>
              <a href="#" className="plan-info-link">Xem Các gói dịch vụ</a>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PlanUpgrade;