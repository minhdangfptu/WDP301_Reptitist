// File: frontend/src/pages/PlanUpgrade.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { baseUrl } from '../config';
import '../css/PlanUpgrade.css';
import PlanDetailConfirmationModal from './PlanDetailConfirmationModal.jsx';
import { FaCheckCircle } from 'react-icons/fa';

const PlanUpgrade = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState('yearly'); // State để theo dõi chu kỳ người dùng chọn

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null); // Sẽ chứa gói được chọn và chu kỳ người dùng đã chọn

  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const token = localStorage.getItem('refresh_token');
        const res = await axios.get(`${baseUrl}/reptitist/admin/get-upgrade-plans`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPlans(res.data);
      } catch (err) {
        console.error("Lỗi khi tải gói:", err);
        setPlans([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const handleSelectPlan = (plan) => {
    if (plan.isFree) {
      alert("Bạn đã chọn gói miễn phí! (Có thể thêm logic kích hoạt gói miễn phí tại đây)");
    } else {
      // *** Cập nhật: Lưu cả billingCycle hiện tại vào selectedPlan ***
      // Khi người dùng click 'Select', chúng ta cần biết họ đang xem giá theo chu kỳ nào.
      setSelectedPlan({ ...plan, selectedBillingCycle: billingCycle });
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPlan(null);
  };

  const handleConfirmUpgrade = (planToUpgrade, confirmedBillingCycle) => {
    console.log("Tiến hành thanh toán cho gói:", planToUpgrade.code);
    console.log("Chu kỳ thanh toán được xác nhận:", confirmedBillingCycle); // Log để debug
    closeModal();

    navigate('/checkout', {
        state: {
            plan: planToUpgrade,
            billingCycle: confirmedBillingCycle // Truyền chu kỳ đã được xác nhận từ modal
        }
    });
  };

  const getPriceByCycle = (plan) => {
    if (billingCycle === 'monthly' && plan.monthlyPrice !== undefined) {
      return plan.monthlyPrice;
    }
    if (billingCycle === 'yearly' && plan.yearlyPrice !== undefined) {
      return plan.yearlyPrice;
    }
    return plan.price; // Giá mặc định nếu không có monthlyPrice/yearlyPrice
  };

  return (
    <>
      <Header />
      <div className="plan-upgrade-page">
        <div className="plan-container">
          <h1 className="plan-upgrade-title">Nâng cấp gói của bạn</h1>

          <div className="billing-toggle">
            <button
              className={`toggle-btn ${billingCycle === 'yearly' ? 'active' : ''}`}
              onClick={() => setBillingCycle('yearly')}
            >
              Yearly discount
            </button>
            <button
              className={`toggle-btn ${billingCycle === 'monthly' ? 'active' : ''}`}
              onClick={() => setBillingCycle('monthly')}
            >
              Monthly
            </button>
          </div>

          {loading ? (
            <div className="loading">Đang tải gói dịch vụ...</div>
          ) : plans.length === 0 ? (
            <div className="no-plans">Không có gói nâng cấp nào để hiển thị.</div>
          ) : (
            <div className="plan-plans-grid">
              {plans.map(plan => {
                const features = plan.description ?
                                 plan.description.split('.').map(f => f.trim()).filter(f => f) :
                                 [];
                const currentPrice = getPriceByCycle(plan);

                return (
                  <div
                    className={`plan-card ${plan.isFree ? 'free-plan' : ''} ${plan.isPopular ? 'popular' : ''}`}
                    key={plan._id}
                  >
                    {plan.isPopular && <div className="popular-badge">Popular</div>}

                    <div className="plan-header">
                      <h3 className="plan-name">{plan.code}</h3>
                      {plan.contacts && <p className="plan-contacts">{plan.contacts}</p>}

                      <div className="plan-pricing">
                        {plan.originalPrice && <span className="original-price">{plan.originalPrice} VNĐ</span>}

                        <span className="plan-price">
                          {plan.isFree ? 'Free' : `${currentPrice} VNĐ`}
                        </span>
                        <span className="plan-period">
                          {plan.isFree ? ' ' : `/ ${billingCycle === 'monthly' ? 'tháng' : '12 tháng'}`}
                        </span>
                      </div>
                    </div>

                    <button
                      className={`plan-select-btn ${plan.isFree ? 'disabled' : ''}`}
                      onClick={() => handleSelectPlan(plan)}
                      disabled={plan.isFree}
                    >
                      Select
                    </button>

                    <div className="plan-features">
                      {features.map((feature, index) => (
                        <div className="feature-item" key={index}>
                          <FaCheckCircle className="feature-icon" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />

      {/* Sử dụng Modal */}
      {selectedPlan && (
        <PlanDetailConfirmationModal
          isOpen={isModalOpen}
          onClose={closeModal}
          plan={selectedPlan} // selectedPlan bây giờ chứa cả selectedBillingCycle
          billingCycle={selectedPlan.selectedBillingCycle} // Truyền chu kỳ đã chọn vào modal
          onConfirmUpgrade={handleConfirmUpgrade}
        />
      )}
    </>
  );
};

export default PlanUpgrade;