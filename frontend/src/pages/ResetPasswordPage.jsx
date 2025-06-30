"use client"

import React, { useState, useEffect } from "react"
import { Button } from "react-bootstrap"
import { useLocation, useNavigate } from "react-router-dom"
import { Eye, EyeOff } from "lucide-react"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import "../css/ResetPassword.css"
import { baseUrl } from '../config';


function ResetPasswordPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const email = location.state?.email || ""
  const isVerified = location.state?.verified || false

  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!email || !isVerified) {
      toast.error("Vui lòng xác thực email trước khi đặt lại mật khẩu.")
      navigate("/forgot-password")
    }
  }, [email, isVerified, navigate])

  const getPasswordStrength = (password) => {
    if (password.length < 6) return { strength: 0, text: "Quá yếu", class: "weak" }
    if (password.length < 8) return { strength: 1, text: "Yếu", class: "weak" }
    if (password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)) {
      return { strength: 3, text: "Mạnh", class: "strong" }
    }
    return { strength: 2, text: "Trung bình", class: "medium" }
  }

  const passwordStrength = getPasswordStrength(newPassword)

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      toast.error("Vui lòng nhập đầy đủ thông tin.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/reptitist/user/change-password-by-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          newPassword,
        }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        toast.success("Đổi mật khẩu thành công! Đang chuyển về trang đăng nhập...");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        toast.error(data.message || "Có lỗi xảy ra. Vui lòng thử lại sau.");
      }
    } catch (err) {
      toast.error("Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-password-layout">
      <ToastContainer position="top-right" autoClose={4000} />
      <div className="reset-password-left">
        <img src="/BGLogin.jpg" alt="Reptile background" />
      </div>
      <div className="reset-password-right">
        <div className="rp-card">
          <div className="rp-logo">
            <img src="/logo1_conen-01-01.png" alt="Reptisist Logo" />
          </div>

          <div className="rp-header">
            <h1 className="rp-title">Đặt lại mật khẩu</h1>
            <p className="rp-subtitle">Nhập mật khẩu mới cho tài khoản: <strong>{email}</strong></p>
          </div>

          <form className="rp-form" onSubmit={handleSubmit}>
            <div className="rp-form-group">
              <label className="rp-label">Email đã xác minh</label>
              <input
                type="email"
                className="rp-input"
                value={email}
                disabled
                style={{ backgroundColor: "#e8f5e8", color: "#0a5a0a" }}
              />
              <div style={{ fontSize: "12px", color: "#28a745", marginTop: "5px" }}>
                ✓ Email đã được xác thực
              </div>
            </div>

            <div className="rp-form-group">
              <label className="rp-label">Mật khẩu mới</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  className="rp-input"
                  placeholder="Nhập mật khẩu mới"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={loading}
                  style={{ paddingRight: "3rem" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "1rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "#6b7280",
                    cursor: "pointer",
                  }}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {newPassword && (
                <div className="rp-password-strength">
                  {[1, 2, 3].map((level) => (
                    <div
                      key={level}
                      className={`rp-strength-bar ${level <= passwordStrength.strength ? passwordStrength.class : ""}`}
                    />
                  ))}
                </div>
              )}
              {newPassword && (
                <div className={`rp-strength-text ${passwordStrength.class}`}>Độ mạnh: {passwordStrength.text}</div>
              )}
            </div>

            <div className="rp-form-group">
              <label className="rp-label">Xác nhận mật khẩu</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="rp-input"
                  placeholder="Nhập lại mật khẩu mới"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  style={{ paddingRight: "3rem" }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: "absolute",
                    right: "1rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "#6b7280",
                    cursor: "pointer",
                  }}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button type="submit" className="rp-submit-button" disabled={loading}>
              {loading ? (
                <span className="rp-loading">
                  <span className="rp-spinner"></span>
                  Đang xử lý...
                </span>
              ) : (
                "Xác nhận đổi mật khẩu"
              )}
            </button>
          </form>

          {/* <div className="rp-back-link">
            <button className="rp-link" onClick={() => navigate("/login")}>
              ← Quay lại đăng nhập
            </button>
          </div> */}
        </div>
      </div>
    </div>
  )
}

export default ResetPasswordPage
