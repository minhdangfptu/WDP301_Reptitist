"use client"
import { useNavigate } from "react-router-dom"

export default function Component() {
    const navigate = useNavigate();
  const cardStyle = {
    maxWidth: "400px",
    margin: "0 auto",
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    border: "1px solid #e5e7eb",
    overflow: "hidden",
  }

  const containerStyle = {
    minHeight: "100vh",
    backgroundColor: "#f9fafb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "16px",
    fontFamily: "system-ui, -apple-system, sans-serif",
  }

  const headerStyle = {
    textAlign: "center",
    padding: "32px 24px 16px",
  }

  const iconStyle = {
    width: "64px",
    height: "64px",
    backgroundColor: "#fef2f2",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 24px",
    fontSize: "32px",
  }

  const titleStyle = {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#111827",
    marginBottom: "8px",
  }

  const descriptionStyle = {
    color: "#6b7280",
    fontSize: "16px",
    lineHeight: "1.5",
  }

  const contentStyle = {
    padding: "0 24px 32px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  }

  const primaryButtonStyle = {
    width: "100%",
    backgroundColor: "#00843D",
    color: "white",
    border: "none",
    borderRadius: "6px",
    padding: "12px 16px",
    fontSize: "16px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "background-color 0.2s",
  }

  const secondaryButtonStyle = {
    width: "100%",
    backgroundColor: "transparent",
    color: "#374151",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    padding: "12px 16px",
    fontSize: "16px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "background-color 0.2s",
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={headerStyle}>
          <div style={iconStyle}>🔒</div>
          <h1 style={titleStyle}>Truy cập bị hạn chế</h1>
          <p style={descriptionStyle}>
            Bạn không có quyền truy cập vào nội dung này. Vui lòng nâng cấp tài khoản để tiếp tục.
          </p>
        </div>

        <div style={contentStyle}>
          <button
            style={primaryButtonStyle}
            onMouseOver={e => (e.target.style.backgroundColor = "#006837")}
            onMouseOut={e => (e.target.style.backgroundColor = "#00843D")}
            onClick={() => navigate("/PlanUpgrade")}
          >
            Nâng cấp tài khoản →
          </button>

          <button
            style={secondaryButtonStyle}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#f9fafb")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "transparent")}
            onClick={() => navigate(-1)}
          >
            ← Quay lại
          </button>
        </div>
      </div>
    </div>
  )
}
