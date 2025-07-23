// // File: frontend/src/pages/PlanUpgrade.jsx
// // Updated để tích hợp PlanDetailModal cho tất cả gói trừ gói miễn phí

// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import Header from '../components/Header';
// import Footer from '../components/Footer';
// import { baseUrl } from '../config';
// import '../css/PlanUpgrade.css';

// const PlanUpgrade = () => {
//   const [plans, setPlans] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchPlans = async () => {
//       try {
//         const token = localStorage.getItem('refresh_token');
//         const res = await axios.get(`${baseUrl}/reptitist/admin/get-upgrade-plans`, {
//           headers: { Authorization: `Bearer ${token}` }
//         });
//         setPlans(res.data);
//       } catch (err) {
//         setPlans([]);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchPlans();
//   }, []);

//   return (
//     <>
//       <Header />
//       <div className="plan-upgrade-page">
//         <div className="plan-container">
//           <h1 className="plan-upgrade-title">Nâng cấp gói của bạn</h1>
//           {loading ? (
//             <div>Đang tải...</div>
//           ) : plans.length === 0 ? (
//             <div>Không có gói nâng cấp nào.</div>
//           ) : (
//             <div className="plan-plans-grid">
//               {plans.map(plan => (
//                 <div className="plan-card" key={plan._id}>
//                   <div className="plan-header">
//                     <h3 className="plan-name">{plan.code}</h3>
//                     <div className="plan-pricing">
//                       <span className="plan-price">{plan.price} VNĐ</span>
//                       <span className="plan-period">/{plan.duration} tháng</span>
//                     </div>
//                     <p className="plan-description">{plan.description}</p>
//                   </div>
//                   {/* Thêm nút mua/nâng cấp nếu cần */}
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//       <Footer />
//     </>
//   );
// };

// export default PlanUpgrade;
// File: frontend/src/pages/PlanUpgrade.jsx
// Updated để tích hợp PlanDetailModal cho tất cả gói trừ gói miễn phí

import React, { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PlanDetailModal from "../components/PlanDetailModal"; // Import component mới
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../css/PlanUpgrade.css";

const PlanUpgrade = () => {
  const [activeTab, setActiveTab] = useState("individual");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPlanDetail, setSelectedPlanDetail] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handlePlanSelect = (planKey, plan) => {
    if (plan.isCurrent) return;

    if (!user) {
      toast.info("Vui lòng đăng nhập để nâng cấp gói dịch vụ", {
        position: "top-right",
        autoClose: 3000,
        onClose: () => navigate("/Login"),
      });
      return;
    }

    // Show detail modal for all plans except free plan
    if (planKey !== "free") {
      // Add planType to the plan data
      const planWithType = {
        ...plan,
        planType: activeTab === "individual" ? "individual" : "partner",
      };
      setSelectedPlanDetail(planWithType);
      setShowDetailModal(true);
    } else {
      // Direct action for free plan (shouldn't happen since free is current)
      toast.info(`Gói ${plan.name} hiện đang được sử dụng`, {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handlePurchase = (purchaseData) => {
    const { period, price, planName } = purchaseData;
    const periodText = period === "monthly" ? "hàng tháng" : "hàng năm";

    // Navigate to payment processing page with planType
    navigate("/payment-processing", {
      state: {
        period,
        price,
        planName,
        planType: activeTab === "individual" ? "individual" : "partner",
      },
    });
    setShowDetailModal(false);
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedPlanDetail(null);
  };

  const individualPlans = {
    free: {
      name: "Miễn phí",
      price: 0,
      period: "VNĐ/tháng",
      description:
        "Khám phá những tiện ích cơ bản của Reptitist để chăm sóc bò sát mỗi ngày một cách dễ dàng và hiệu quả.",
      features: [
        "Tìm kiếm thông tin về các loài bò sát",
        "Truy cập thư viện kiến thức đa dạng",
        "Mua sắm các sản phẩm chăm sóc bò sát",
        "Cập nhật tin tức mới nhất về thế giới bò sát",
      ],
      buttonText: "Đây là gói bạn đang sử dụng",
      buttonStyle: "outline",
      isCurrent: true,
    },
    premium: {
      name: "Premium",
      price: 79000,
      oneTimePrice: 749000,
      period: "VNĐ/tháng",
      description:
        "Nâng tầm trải nghiệm cùng Reptitist với nhiều quyền lợi mở rộng, hỗ trợ bạn chăm sóc bò sát thông minh hơn",
      popular: true,
      features: [
        "Bao gồm tất cả tính năng của gói Miễn phí",
        "Trợ lý ảo AI hỗ trợ 24/7",
        "Truy cập không giới hạn thư viện kiến thức",
        "Tìm kiếm chuyên sâu về bò sát",
        "Cá nhân hóa hồ sơ người dùng và bò sát",
        "Hệ sinh thái chăm sóc toàn diện",
        "Mua sắm sản phẩm chuyên biệt cho bò sát",
        "Góp ý và đề xuất cho bò sát của bạn",
      ],
      buttonText: "Khám phá chi tiết",
      buttonStyle: "primary",
    },
  };

  const partnerPlans = {
    basic: {
      name: "Gói cơ bản",
      price: 199000,
      oneTimePrice: 1990000,
      period: "VNĐ/tháng",
      description:
        "Giải pháp tối ưu cho các cửa hàng nhỏ, giúp bạn kết nối với cộng đồng và quản lý kinh doanh hiệu quả.",
      features: [
        "Tận hưởng mọi tính năng của Gói Cá nhân",
        "Đăng bán số lượng sản phẩm giới hạn",
        "Báo cáo thống kê cơ bản cho cửa hàng",
      ],
      buttonText: "Khám phá chi tiết",
      buttonStyle: "outline",
    },
    premium: {
      name: "Gói Premium",
      price: 299000,
      oneTimePrice: 2990000,
      period: "VNĐ/tháng",
      description:
        "Trải nghiệm giải pháp kinh doanh chuyên nghiệp, mở rộng quy mô và nâng cao hiệu quả với nhiều đặc quyền nổi bật.",
      popular: true,
      features: [
        "Bao gồm mọi tính năng của Gói Cá nhân",
        "Kết nối sâu rộng với cộng đồng bò sát",
        "Đăng bán sản phẩm không giới hạn",
        "Không giới hạn tham gia FLASH SALE",
        "Hỗ trợ khách hàng ưu tiên",
        "Báo cáo thống kê chi tiết cho cửa hàng",
        "Ưu tiên hiển thị trên trang chủ",
        "Được đề xuất quảng cáo nổi bật",
      ],
      buttonText: "Khám phá chi tiết",
      buttonStyle: "primary",
    },
  };

  const currentPlans =
    activeTab === "individual" ? individualPlans : partnerPlans;

  const formatPrice = (price) => {
    if (price === 0) return "0";
    return new Intl.NumberFormat("vi-VN").format(price);
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
              Bạn muốn trở thành đối tác của chúng tôi? Hãy tham khảo các gói
              dịch vụ sau
            </p>
          </div>

          {/* Tab Toggle */}
          <div className="plan-toggle">
            <button
              className={`plan-toggle-btn ${
                activeTab === "individual" ? "active" : ""
              }`}
              onClick={() => setActiveTab("individual")}
            >
              Cá nhân
            </button>
            <button
              className={`plan-toggle-btn ${
                activeTab === "partner" ? "active" : ""
              }`}
              onClick={() => setActiveTab("partner")}
            >
              Đối tác
            </button>
          </div>

          {/* Plans Grid */}
          <div className="plan-plans-container">
            <div className="plan-plans-grid">
              {Object.entries(currentPlans).map(([key, plan]) => (
                <div
                  key={key}
                  className={`plan-card ${plan.popular ? "popular" : ""}`}
                >
                  {plan.popular && (
                    <div className="plan-popular-badge">Popular</div>
                  )}

                  <div className="plan-content">
                    <div className="plan-header">
                      <h3 className="plan-name">{plan.name}</h3>
                      <div className="plan-pricing">
                        <span className="plan-currency">đ</span>
                        <span className="plan-price">
                          {formatPrice(plan.price)}
                        </span>
                        <span className="plan-period">{plan.period}</span>
                      </div>
                      <p className="plan-description">{plan.description}</p>
                    </div>

                    <button
                      className={`plan-button ${plan.buttonStyle} ${
                        plan.isCurrent ? "current" : ""
                      }`}
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
                              <svg
                                className="plan-feature-icon"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
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
                      Bạn có thể hủy bỏ bất cứ lúc nào theo thỏa thuận này
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
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </div>
            <p className="plan-info-text">
              Bạn cần tìm hiểu thêm về các gói dịch vụ nâng cao?
              <br />
              <a href="#" className="plan-info-link">
                Xem Các gói dịch vụ
              </a>
            </p>
          </div>
        </div>

        {/* Plan Detail Modal */}
        <PlanDetailModal
          isOpen={showDetailModal}
          onClose={handleCloseModal}
          planData={selectedPlanDetail}
          onPurchase={handlePurchase}
        />
      </div>
      <Footer />
    </>
  );
};

export default PlanUpgrade;
