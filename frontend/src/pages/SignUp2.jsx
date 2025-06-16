import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import emailjs from "emailjs-com";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../css/SignUp2.css";

const SignUp2 = () => {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Cấu hình EmailJS - Kiểm tra lại các thông số này
  const EMAILJS_CONFIG = {
    SERVICE_ID: "service_llx7onu", // Xác nhận lại Service ID
    TEMPLATE_ID: "template_dd8viae", // Xác nhận lại Template ID
    PUBLIC_KEY: "qOVKbEY7rEG5Dhe6D", // Xác nhận lại Public Key
  };

  // Hàm gửi mã xác nhận qua Email
  const sendVerificationCode = async (userEmail) => {
    setIsLoading(true);

    try {
      const codeGenerated = Math.floor(100000 + Math.random() * 900000);
      setVerificationCode(codeGenerated.toString());

      // Cấu hình template parameters - Đảm bảo tên biến khớp với EmailJS template
      const templateParams = {
        to_email: userEmail, // Email người nhận
        user_name: "Người dùng", // Tên người dùng
        verification_code: codeGenerated, // Mã xác nhận
        message: `Mã xác nhận của bạn là: ${codeGenerated}`, // Thêm message rõ ràng
      };

      console.log("Sending email with params:", templateParams); // Debug log

      // Gửi email qua EmailJS
      const response = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        templateParams,
        EMAILJS_CONFIG.PUBLIC_KEY
      );

      console.log("EmailJS response:", response); // Debug log

      if (response.status === 200) {
        toast.success(
          "Mã xác nhận đã được gửi tới email của bạn! Vui lòng kiểm tra hộp thư (bao gồm cả thư mục spam).",
          {
            position: "top-right",
            autoClose: 7000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          }
        );
      } else {
        throw new Error(`EmailJS returned status: ${response.status}`);
      }
    } catch (error) {
      console.error("Email sending error:", error);

      // Hiển thị lỗi chi tiết hơn
      let errorMessage = "Đã xảy ra lỗi khi gửi mã xác nhận. ";

      if (error.text) {
        errorMessage += `Chi tiết: ${error.text}`;
      } else if (error.message) {
        errorMessage += `Chi tiết: ${error.message}`;
      } else {
        errorMessage += "Vui lòng kiểm tra kết nối mạng và thử lại.";
      }

      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 10000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Reset trạng thái nếu gửi email thất bại
      setCurrentStep("initial");
      setIsRegistered(false);
      setShowCodeInput(false);
    } finally {
      setIsLoading(false);
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignUpClick = async () => {
    // Validate email
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

    // Hiển thị thông báo bắt đầu gửi
    toast.info("Đang gửi mã xác nhận đến email của bạn...", {
      position: "top-right",
      autoClose: 3000,
    });

    setShowCodeInput(true);
    setIsRegistered(true);

    // Gửi email xác nhận
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

    // So sánh mã (cả hai đều là string)
    console.log("Verifying code:", code.trim(), "vs", verificationCode); // Debug log

    if (code.trim() === verificationCode) {
      toast.success("Xác thực thành công! Đang chuyển hướng...", {
        position: "top-right",
        autoClose: 2000,
        onClose: () => {
          // Chuyển sang trang SignUp3 với thông tin email và trạng thái xác thực
          navigate("/SignUp3", {
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
    toast.info("Đang gửi lại mã xác nhận...", {
      position: "top-right",
      autoClose: 2000,
    });

    await sendVerificationCode(email.trim());
  };

  const handleBackToEmail = () => {
    setShowCodeInput(false);
    setIsRegistered(false);
    setCode("");
    setVerificationCode("");
  };

  const handleCodeInputChange = (e) => {
    // Chỉ cho phép nhập số và tối đa 6 ký tự
    const inputValue = e.target.value.replace(/\D/g, "").slice(0, 6);
    setCode(inputValue);
  };

  return (
    <div className="signup2-body">
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

      <div className="signup2-container">
        <div className="signup2-content">
          <div className="signup2-logo">
            <img src="/logo1.png" alt="Reptisist Logo" />
          </div>

          <h1 className="signup2-headline">
            Cùng chúng tôi chăm sóc bò sát theo cách chuyên nghiệp
          </h1>

          <p className="signup2-subheadline">
            Website chăm sóc bò sát cung cấp Chatbot AI 24/7, thư viện kiến thức
            phong phú, hỏi đáp cá nhân hóa, và kết nối cộng đồng giúp bạn chăm
            sóc bò sát dễ dàng.
          </p>

          {/* Email Input Section */}
          <div className="signup2-input-wrapper">
            <input
              type="email"
              placeholder="Nhập địa chỉ Email của bạn!"
              className="signup2-email-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isRegistered}
              style={{
                backgroundColor: isRegistered ? "#f0f0f0" : "white",
                cursor: isRegistered ? "not-allowed" : "text",
              }}
            />
          </div>

          {/* Sign Up Button - Only show if not registered */}
          {!isRegistered && (
            <button
              className="signup2-button"
              onClick={handleSignUpClick}
              disabled={isLoading}
              style={{
                opacity: isLoading ? 0.7 : 1,
                cursor: isLoading ? "not-allowed" : "pointer",
              }}
            >
              {isLoading ? "⏳ Đang gửi mã..." : "Đăng ký ngay!"}
            </button>
          )}

          {/* Verification Code Section */}
          {showCodeInput && (
            <div style={{ width: "100%", maxWidth: "340px" }}>
              <div className="signup2-input-wrapper">
                <input
                  type="text"
                  placeholder="Nhập mã xác nhận (6 chữ số)"
                  className="signup2-email-input"
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

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  alignItems: "center",
                  marginTop: "15px",
                }}
              >
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    className="signup2-button"
                    onClick={handleVerifyCode}
                    disabled={code.length !== 6}
                    style={{
                      opacity: code.length !== 6 ? 0.5 : 1,
                      cursor: code.length !== 6 ? "not-allowed" : "pointer",
                    }}
                  >
                    Xác nhận mã
                  </button>

                  <button
                    className="signup2-button secondary"
                    onClick={handleResendCode}
                    disabled={isLoading}
                    style={{
                      backgroundColor: "#6b7280",
                      opacity: isLoading ? 0.5 : 1,
                      cursor: isLoading ? "not-allowed" : "pointer",
                    }}
                  >
                    {isLoading ? "⏳ Đang gửi..." : "Gửi lại"}
                  </button>
                </div>

                <button
                  className="signup2-button"
                  onClick={handleBackToEmail}
                  style={{
                    backgroundColor: "#ef4444",
                    fontSize: "14px",
                    padding: "8px 16px",
                  }}
                >
                  ← Thay đổi email
                </button>
              </div>

              <div
                style={{
                  fontSize: "12px",
                  color: "#666",
                  textAlign: "center",
                  marginTop: "15px",
                  lineHeight: "1.4",
                }}
              >
                ✉️ Mã xác nhận đã được gửi đến <strong>{email}</strong>
                <br />
                Vui lòng kiểm tra hộp thư (bao gồm cả thư mục spam/junk)
                <br />
                <small style={{ color: "#999" }}>
                  Nếu không nhận được email sau 2-3 phút, hãy bấm "Gửi lại"
                </small>
              </div>
            </div>
          )}

          {/* Social Login Options - Hide when showing code input */}
          {!showCodeInput && (
            <>
              <div className="signup2-divider">HOẶC</div>

              <button
                className="social-login-btn"
                // onClick={handleGoogleLogin}
                disabled={true}
                style={{ opacity: 0.6, cursor: "not-allowed" }}
              >
                <span className="google-icon">
                  <img
                    src="https://fonts.gstatic.com/s/i/productlogos/googleg/v6/24px.svg"
                    alt="Google"
                  />
                </span>
                Đăng nhập sử dụng Google
              </button>
              <button
                className="social-login-btn"
                // onClick={handleGoogleLogin}
                disabled={true}
                style={{ opacity: 0.6, cursor: "not-allowed" }}
              >
                <span className="google-icon">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png"
                    alt="Facebook"
                  />
                </span>
                Đăng nhập sử dụng Facebook
              </button>
            </>
          )}

          {/* Terms */}
          <div className="signup2-terms">
            Bằng cách tiếp tục, bạn đồng ý với{" "}
            <a href="#" style={{ color: "#0fa958" }}>
              Điều khoản sử dụng
            </a>{" "}
            và{" "}
            <a href="#" style={{ color: "#0fa958" }}>
              Chính sách bảo mật
            </a>{" "}
            của chúng tôi.
          </div>
        </div>

        <div className="signup2-image">
          {/* The image will be loaded via CSS background */}
        </div>
      </div>
    </div>
  );
};

export default SignUp2;
