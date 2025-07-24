import { useSearchParams } from "react-router-dom"
import { XCircle, ArrowLeft, RefreshCw, Home } from "lucide-react"
import "../css/PaymentCancel.css"

export default function PaymentCancel() {
  const [searchParams] = useSearchParams()
  const orderCode = searchParams.get("orderCode")
  const status = searchParams.get("status")

  const handleRetryPayment = () => {
    console.log("Retry payment for order:", orderCode)
    window.location.href = "/checkout"
  }

  const handleGoHome = () => {
    window.location.href = "/"
  }

  const handleGoBack = () => {
    window.history.back()
  }

  return (
    <div className="payment-cancel-container">
      <div className="payment-cancel-card">
        {/* Header */}
        <div className="payment-cancel-header">
          <div className="payment-cancel-icon-container">
            <XCircle className="payment-cancel-icon" />
          </div>
          <h1 className="payment-cancel-title">Thanh toán bị hủy</h1>
          <p className="payment-cancel-subtitle">Giao dịch của bạn đã bị hủy bỏ</p>
        </div>

        {/* Content */}
        <div className="payment-cancel-content">
          {/* Order Info */}
          <div className="payment-cancel-info">
            <div className="payment-cancel-info-row">
              <span className="payment-cancel-label">Mã đơn hàng:</span>
              <span className="payment-cancel-badge payment-cancel-badge-outline">{orderCode || "N/A"}</span>
            </div>

            <div className="payment-cancel-info-row">
              <span className="payment-cancel-label">Trạng thái:</span>
              <span className="payment-cancel-badge payment-cancel-badge-destructive">{status || "Đã hủy"}</span>
            </div>
          </div>

          {/* Separator */}
          <div className="payment-cancel-separator"></div>

          {/* Message */}
          <div className="payment-cancel-message">
            <p className="payment-cancel-message-text">
              Bạn đã hủy thanh toán. Đơn hàng của bạn chưa được xử lý.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="payment-cancel-actions">

            <div className="payment-cancel-secondary-buttons">

              <button onClick={handleGoHome} className="payment-cancel-secondary-button">
                <Home className="payment-cancel-button-icon" />
                Trang chủ
              </button>
            </div>
          </div>

          {/* Support */}
          <div className="payment-cancel-support">
            <p className="payment-cancel-support-text">
              Cần hỗ trợ? Liên hệ{" "}
              <a href="mailto:support@example.com" className="payment-cancel-support-link">
                support@example.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
