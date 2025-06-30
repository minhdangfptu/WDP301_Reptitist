// src/components/ReportProductModal.jsx
import React, { useState } from 'react';
import '../css/ReportProductModal.css';

const ReportProductModal = ({ isOpen, onClose, onSubmit, productName }) => {
  const [reason, setReason] = useState('spam');
  const [description, setDescription] = useState('');

  if (!isOpen) {
    return null;
  }

  const handleSubmit = () => {
    if (!reason) {
      alert('Vui lòng chọn lý do báo cáo.');
      return;
    }
    // Gửi reason và description riêng biệt
    onSubmit(reason, description);
    setReason('spam');
    setDescription('');
    onClose();
  };

  return (
    <div className="report-modal-overlay">
      <div className="report-modal-content">
        <h2>Báo cáo sản phẩm</h2>
        <p>Bạn đang báo cáo sản phẩm: <strong>{productName}</strong></p>
        <div className="report-reason-select">
          <label>Lý do báo cáo:</label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="report-reason-dropdown"
          >
            <option value="spam">Spam</option>
            <option value="inappropriate">Nội dung không phù hợp</option>
            <option value="fake">Sản phẩm giả mạo</option>
            <option value="violence">Bạo lực</option>
            <option value="copyright">Vi phạm bản quyền</option>
            <option value="other">Khác</option>
          </select>
        </div>
        <textarea
          className="report-reason-textarea"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Mô tả chi tiết lý do báo cáo của bạn (tùy chọn)..."
          rows="5"
          maxLength={500}
        />
        <div className="report-modal-actions">
          <button onClick={onClose} className="report-modal-button cancel">Hủy</button>
          <button onClick={handleSubmit} className="report-modal-button submit">Gửi báo cáo</button>
        </div>
      </div>
    </div>
  );
};

export default ReportProductModal;