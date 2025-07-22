
import React from 'react';
import '../css/PlanDetailConfirmationModal.css';

const PlanDetailConfirmationModal = ({ isOpen, onClose, plan, billingCycle, onConfirmUpgrade }) => {
  if (!isOpen || !plan) return null;

  // Lấy giá hiển thị dựa trên billingCycle được truyền vào
  const displayPrice = billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
  const displayPeriodText = billingCycle === 'monthly' ? 'tháng' : '12 tháng';
  const effectivePlanPrice = plan.isFree ? 'Free' : `${displayPrice} VNĐ`;

  // Tính toán ngày bắt đầu/kết thúc dự kiến
  const startDate = new Date().toLocaleDateString('vi-VN');
  const endDate = new Date();
  if (billingCycle === 'monthly') {
    endDate.setMonth(endDate.getMonth() + 1); // Thêm 1 tháng
  } else { // 'yearly'
    endDate.setFullYear(endDate.getFullYear() + 1); // Thêm 1 năm
  }
  const endDateFormatted = endDate.toLocaleDateString('vi-VN');

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close-btn" onClick={onClose}>&times;</button>
        <h2 className="modal-title">Xác nhận gói nâng cấp</h2>

        <div className="modal-plan-summary">
          <h3>{plan.code}</h3>
          <p className="modal-plan-price">{effectivePlanPrice} / {displayPeriodText}</p> {/* Sử dụng displayPeriodText */}
          <p className="modal-plan-description">{plan.description}</p>
          {plan.contacts && <p className="modal-plan-contacts">Liên hệ: {plan.contacts}</p>}

          <div className="modal-plan-details">
            <p><strong>Ngày bắt đầu:</strong> {startDate}</p>
            <p><strong>Ngày kết thúc dự kiến:</strong> {endDateFormatted}</p>
            <p>
              {/* Cập nhật hiển thị Thời hạn gói dựa trên billingCycle */}
              <strong>Thời hạn gói:</strong> {billingCycle === 'monthly' ? '1 tháng' : '12 tháng'}
            </p>
          </div>

        </div>

        <button
          className="confirm-upgrade-btn"
          onClick={() => onConfirmUpgrade(plan, billingCycle)} // Truyền cả plan và billingCycle
        >
          Tiến hành thanh toán
        </button>
      </div>
    </div>
  );
};

export default PlanDetailConfirmationModal;