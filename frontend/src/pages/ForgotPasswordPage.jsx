import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import emailjs from "emailjs-com";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../css/ForgotPasswordPage.css";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Cấu hình EmailJS
  const EMAILJS_CONFIG = {
    SERVICE_ID: "service_9ylk5f6",
    TEMPLATE_ID: "template_qtebeko",
    PUBLIC_KEY: "5IefcaQyE5-34pRbq",
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Gửi mã xác thực qua email
  const sendVerificationCode = async (userEmail) => {
    setIsLoading(true);
    try {
      const codeGenerated = Math.floor(100000 + Math.random() * 900000);
      setVerificationCode(codeGenerated.toString());
      const templateParams = {
        to_email: userEmail,
        verification_code: codeGenerated,
      };
      toast.info(
        "Đang gửi mã xác nhận đến email của bạn...",
        {
          position: "top-right",
          autoClose: 3000,
          toastId: "sending-toast",
        }
      );
      const response = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        templateParams,
        EMAILJS_CONFIG.PUBLIC_KEY
      );
      if (response.status === 200) {
        toast.dismiss("sending-toast");
        toast.success(
          "Mã xác nhận đã được gửi tới email của bạn! Vui lòng kiểm tra hộp thư (bao gồm cả thư mục spam).",
          { position: "top-right", autoClose: 3000 }
        );
        setShowCodeInput(true);
      } else {
        throw new Error(`EmailJS returned status: ${response.status}`);
      }
    } catch (error) {
      let errorMessage = "Đã xảy ra lỗi khi gửi mã xác nhận. ";
      if (error.text) errorMessage += `Chi tiết: ${error.text}`;
      else if (error.message) errorMessage += `Chi tiết: ${error.message}`;
      else errorMessage += "Vui lòng kiểm tra kết nối mạng và thử lại.";
      toast.error(errorMessage, { position: "top-right", autoClose: 10000 });
      setShowCodeInput(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Vui lòng nhập địa chỉ email.", {
        position: "top-right",
        autoClose: 5000,
      });
      return;
    }
    if (!validateEmail(email.trim())) {
      toast.error("Vui lòng nhập địa chỉ email hợp lệ.", {
        position: "top-right",
        autoClose: 5000,
      });
      return;
    }
    await sendVerificationCode(email.trim());
  };

  const handleVerifyCode = () => {
    if (!code.trim()) {
      toast.error("Vui lòng nhập mã xác nhận.", {
        position: "top-right",
        autoClose: 5000,
      });
      return;
    }
    if (code.length !== 6) {
      toast.error("Mã xác nhận phải có 6 chữ số.", {
        position: "top-right",
        autoClose: 5000,
      });
      return;
    }
    if (code.trim() === verificationCode) {
      toast.success("Xác thực thành công! Đang chuyển hướng...", {
        position: "top-right",
        autoClose: 2000,
        onClose: () => {
          navigate("/reset-password", {
            state: {
              email: email.trim(),
              verified: true,
            },
          });
        },
      });
    } else {
      toast.error("Mã xác nhận không đúng. Vui lòng kiểm tra lại.", {
        position: "top-right",
        autoClose: 5000,
      });
    }
  };

  const handleResendCode = async () => {
    if (isLoading) return;
    setCode("");
    toast.info("Xác nhận gửi lại mã xác nhận...", {
      position: "top-right",
      autoClose: 2000,
    });
    await sendVerificationCode(email.trim());
  };

  const handleBackToEmail = () => {
    setShowCodeInput(false);
    setCode("");
    setVerificationCode("");
  };

  const handleCodeInputChange = (e) => {
    const inputValue = e.target.value.replace(/\D/g, "").slice(0, 6);
    setCode(inputValue);
  };

  const handleBackToLogin = () => {
    navigate("/Login");
  };

  return (
    <div className="forgot-password-layout">
      <ToastContainer position="top-right" autoClose={5000} />
      <div className="forgot-password-left">
        <img src="/BGLogin.jpg" alt="Reptile background" />
      </div>
      <div className="forgot-password-right">
        <div className="fp-card">
          <div className="fp-logo">
            <img src="/logo1_conen-01-01.png" alt="Reptisist Logo" />
          </div>
          {!showCodeInput ? (
            <>
              <div className="fp-header">
                <h1 className="fp-title">Quên mật khẩu?</h1>
                <p className="fp-subtitle">
                  Nhập địa chỉ email của bạn và chúng tôi sẽ gửi mã xác thực để
                  đặt lại mật khẩu
                </p>
              </div>
              <form className="fp-form" onSubmit={handleSendCode}>
                <div className="fp-form-group">
                  <label htmlFor="email" className="fp-label">
                    Địa chỉ email
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="fp-input"
                    placeholder="Nhập địa chỉ email của bạn"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    autoComplete="email"
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  className="fp-submit-button"
                  disabled={isLoading}
                >
                  {isLoading ? "Đang gửi..." : "Gửi mã xác thực"}
                </button>
              </form>
              <div className="fp-back-link">
                <button className="fp-link" onClick={handleBackToLogin}>
                  ← Quay lại trang đăng nhập
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="fp-header">
                <h1 className="fp-title">Nhập mã xác thực</h1>
                <p className="fp-subtitle">
                  Mã xác thực đã được gửi đến <strong>{email}</strong>.<br />
                  Vui lòng kiểm tra hộp thư (bao gồm cả thư mục spam).
                </p>
              </div>
              <div className="fp-form-group">
                <input
                  type="text"
                  placeholder="Nhập mã xác thực (6 chữ số)"
                  className="fp-input"
                  value={code}
                  onChange={handleCodeInputChange}
                  maxLength="6"
                  style={{
                    textAlign: "left",
                    fontSize: "13px",
                    letterSpacing: "0.5px",
                  }}
                />
              </div>
              <div style={{ gap: "10px", marginTop: "10px" }}>
                <button
                  className="fp-submit-button"
                  onClick={handleVerifyCode}
                  disabled={code.length !== 6}
                  style={{ opacity: code.length !== 6 ? 0.5 : 1 }}
                >
                  Xác nhận mã
                </button>
                <button
                  className="fp-submit-button"
                  onClick={handleResendCode}
                  disabled={isLoading}
                  style={{
                    backgroundColor: "#6b7280",
                    opacity: isLoading ? 0.5 : 1,
                  }}
                >
                  {isLoading ? "Đang gửi..." : "Gửi lại"}
                </button>
              </div>
              <button
                className="fp-link"
                onClick={handleBackToEmail}
                style={{ color: "#ef4444", marginTop: "10px" }}
              >
                ← Thay đổi email
              </button>
              <div className="fp-back-link">
                <button className="fp-link" onClick={handleBackToLogin}>
                  ← Quay lại trang đăng nhập
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
