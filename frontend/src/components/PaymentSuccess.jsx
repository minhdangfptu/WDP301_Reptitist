import { useSearchParams } from "react-router-dom"
import { CheckCircle, Home, FileText, Download } from "lucide-react"
import "../css/PaymentSuccess.css"

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams()
  const orderCode = searchParams.get("orderCode")
  const status = searchParams.get("status")

  

  const handleGoHome = () => {
    window.location.href = "/"
  }

  

  return (
    <div className="payment-success-container">
      <div className="payment-success-card">
        {/* Header */}
        <div className="payment-success-header">
          <div className="payment-success-icon-container">
            <CheckCircle className="payment-success-icon" />
          </div>
          <h1 className="payment-success-title">Thanh toán thành công!</h1>
          <p className="payment-success-subtitle">Giao dịch đã được xử lý thành công</p>
        </div>

        {/* Content */}
        <div className="payment-success-content">
          {/* Order Info */}
          <div className="payment-success-info">
            <div className="payment-success-info-row">
              <span className="payment-success-label">Mã đơn hàng:</span>
              <span className="payment-success-badge payment-success-badge-outline">{orderCode || "N/A"}</span>
            </div>

            <div className="payment-success-info-row">
              <span className="payment-success-label">Trạng thái:</span>
              <span className="payment-success-badge payment-success-badge-success">{status || "Thành công"}</span>
            </div>
          </div>

          {/* Separator */}
          <div className="payment-success-separator"></div>

          {/* Message */}
          <div className="payment-success-message">
            <p className="payment-success-message-text">
              Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi! Quay về trang chủ để sử dụng các tính năng nâng cao hơn.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="payment-success-actions " >

            <div className="payment-success-secondary-buttons">

              <button onClick={handleGoHome} className="payment-success-secondary-button" >
                <Home className="payment-success-button-icon" />
                Trang chủ
              </button>
            </div>
          </div>

          {/* Support */}
          <div className="payment-success-support">
            <p className="payment-success-support-text">
              Cần hỗ trợ? Liên hệ{" "}
              <a href="mailto:support@example.com" className="payment-success-support-link">
                support@example.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
