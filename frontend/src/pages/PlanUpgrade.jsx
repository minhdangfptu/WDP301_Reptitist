// File: frontend/src/pages/PlanUpgrade.jsx
// Updated để tích hợp PlanDetailModal cho tất cả gói trừ gói miễn phí

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { baseUrl } from '../config';
import '../css/PlanUpgrade.css';

const PlanUpgrade = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const token = localStorage.getItem('refresh_token');
        const res = await axios.get(`${baseUrl}/reptitist/admin/get-upgrade-plans`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPlans(res.data);
      } catch (err) {
        setPlans([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  return (
    <>
      <Header />
      <div className="plan-upgrade-page">
        <div className="plan-container">
          <h1 className="plan-upgrade-title">Nâng cấp gói của bạn</h1>
          {loading ? (
            <div>Đang tải...</div>
          ) : plans.length === 0 ? (
            <div>Không có gói nâng cấp nào.</div>
          ) : (
            <div className="plan-plans-grid">
              {plans.map(plan => (
                <div className="plan-card" key={plan._id}>
                  <div className="plan-header">
                    <h3 className="plan-name">{plan.code}</h3>
                    <div className="plan-pricing">
                      <span className="plan-price">{plan.price} VNĐ</span>
                      <span className="plan-period">/{plan.duration} tháng</span>
                    </div>
                    <p className="plan-description">{plan.description}</p>
                  </div>
                  {/* Thêm nút mua/nâng cấp nếu cần */}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PlanUpgrade;