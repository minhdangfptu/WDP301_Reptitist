import React, { useState } from 'react';
import '../css/EmailNotificationInfo.css';

const EmailNotificationInfo = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="email-notification-info">
      <div 
        className="email-notification-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="email-notification-title">
          <i className="fas fa-envelope"></i>
          <span>Thông báo Email</span>
        </div>
        <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'}`}></i>
      </div>
      
      {isExpanded && (
        <div className="email-notification-content">
          <div className="email-notification-section">
            <h4><i className="fas fa-exclamation-triangle"></i> Khi chấp nhận báo cáo sản phẩm:</h4>
            <div className="email-notification-item">
              <i className="fas fa-check-circle"></i>
              <span>Email sẽ được gửi tự động khi admin chấp nhận báo cáo sản phẩm</span>
            </div>
            <div className="email-notification-item">
              <i className="fas fa-user"></i>
              <span>Người nhận: Chủ shop có sản phẩm bị báo cáo</span>
            </div>
            <div className="email-notification-item">
              <i className="fas fa-info-circle"></i>
              <span>Nội dung: Thông tin chi tiết về báo cáo và hướng dẫn xử lý</span>
            </div>
          </div>
          
          <div className="email-notification-section">
            <h4><i className="fas fa-eye"></i> Khi gỡ bỏ ẩn sản phẩm:</h4>
            <div className="email-notification-item">
              <i className="fas fa-check-circle"></i>
              <span>Email sẽ được gửi tự động khi admin gỡ bỏ ẩn sản phẩm</span>
            </div>
            <div className="email-notification-item">
              <i className="fas fa-user"></i>
              <span>Người nhận: Chủ shop có sản phẩm được gỡ bỏ ẩn</span>
            </div>
            <div className="email-notification-item">
              <i className="fas fa-info-circle"></i>
              <span>Nội dung: Thông báo sản phẩm đã có thể bán lại và hướng dẫn</span>
            </div>
          </div>
          
          <div className="email-notification-section">
            <h4><i className="fas fa-trash"></i> Khi xóa sản phẩm:</h4>
            <div className="email-notification-item">
              <i className="fas fa-check-circle"></i>
              <span>Email sẽ được gửi tự động khi admin xóa sản phẩm</span>
            </div>
            <div className="email-notification-item">
              <i className="fas fa-user"></i>
              <span>Người nhận: Chủ shop có sản phẩm bị xóa</span>
            </div>
            <div className="email-notification-item">
              <i className="fas fa-info-circle"></i>
              <span>Nội dung: Thông báo sản phẩm đã bị xóa vĩnh viễn và hướng dẫn</span>
            </div>
          </div>
          
          <div className="email-notification-item">
            <i className="fas fa-shield-alt"></i>
            <span>Bảo mật: Chỉ gửi khi admin thực hiện các hành động tương ứng</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailNotificationInfo; 