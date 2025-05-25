import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import emailjs from "emailjs-com";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "../css/SignUp2.css";

const SignUp2 = () => {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Hàm gửi mã xác nhận qua Email
  const sendVerificationCode = (userEmail) => {
    setIsLoading(true);
    
    const codeGenerated = Math.floor(100000 + Math.random() * 900000);
    setVerificationCode(codeGenerated.toString()); // Lưu dưới dạng string

    const templateParams = {
      user_name: "Người dùng",
      verification_code: codeGenerated,
      to_email: userEmail,
    };

    emailjs.send(
      "service_llx7onu",
      "template_dd8viae",
      templateParams,
      "qOVKbEY7rEG5Dhe6D"
    )
    .then((response) => {
      console.log("Mã xác nhận đã được gửi thành công!", response);
      toast.success("Mã xác nhận đã được gửi tới email của bạn. Vui lòng kiểm tra hộp thư.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });
    })
    .catch((error) => {
      console.log("Có lỗi xảy ra khi gửi email:", error);
      toast.error("Đã xảy ra lỗi khi gửi mã xác nhận. Vui lòng thử lại.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });
    })
    .finally(() => {
      setIsLoading(false);
    });
  };

  const handleSignUpClick = () => {
    if (!email.trim()) {
      toast.error("Vui lòng nhập địa chỉ email.", {
        position: "top-right",
        autoClose: 5000
      });
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Vui lòng nhập địa chỉ email hợp lệ.", {
        position: "top-right",
        autoClose: 5000
      });
      return;
    }

    setShowCodeInput(true);
    setIsRegistered(true);
    sendVerificationCode(email);
  };

  const handleVerifyCode = () => {
    if (!code.trim()) {
      toast.error("Vui lòng nhập mã xác nhận.", {
        position: "top-right",
        autoClose: 5000
      });
      return;
    }

    // So sánh mã (cả hai đều là string)
    if (code.trim() === verificationCode) {
      toast.success("Xác thực thành công!", {
        position: "top-right",
        autoClose: 2000,
        onClose: () => {
          // Chuyển sang trang SignUp3 với thông tin email và trạng thái xác thực
          navigate("/SignUp3", { 
            state: { 
              email: email.trim(), 
              verified: true 
            } 
          });
        }
      });
    } else {
      toast.error("Mã xác nhận không đúng. Vui lòng kiểm tra lại.", {
        position: "top-right",
        autoClose: 5000
      });
    }
  };

  const handleResendCode = () => {
    setCode("");
    toast.info("Đang gửi lại mã xác nhận...", {
      position: "top-right",
      autoClose: 2000
    });
    sendVerificationCode(email);
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
            Website chăm sóc bò sát cung cấp Chatbot AI 24/7, thư viện kiến thức phong phú, hỏi đáp cá nhân hóa, và kết nối cộng đồng giúp bạn chăm sóc bò sát dễ dàng.
          </p>
          
          <div className="signup2-input-wrapper">
            <input 
              type="email" 
              placeholder="Nhập địa chỉ Email của bạn!" 
              className="signup2-email-input"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
              }}
              disabled={isRegistered}
            />
          </div>

          {/* Hiển thị nút đăng ký chỉ khi chưa đăng ký */}
          {!isRegistered && (
            <button 
              className="signup2-button" 
              onClick={handleSignUpClick}
              disabled={isLoading}
            >
              {isLoading ? "Đang gửi mã..." : "Đăng ký ngay!"}
            </button>
          )}

          {/* Hiển thị trường nhập mã xác nhận nếu cần */}
          {showCodeInput && (
            <>
              <div className="signup2-input-wrapper">
                <input
                  type="text"
                  placeholder="Nhập mã xác nhận (6 chữ số)"
                  className="signup2-email-input"
                  value={code}
                  onChange={(e) => {
                    // Chỉ cho phép nhập số và tối đa 6 ký tự
                    const inputValue = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setCode(inputValue);
                  }}
                  maxLength="6"
                />
              </div>
              
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button 
                  className="signup2-button" 
                  onClick={handleVerifyCode}
                  disabled={code.length !== 6}
                >
                  Xác nhận mã
                </button>
                
                <button 
                  className="signup2-button secondary" 
                  onClick={handleResendCode}
                  disabled={isLoading}
                >
                  {isLoading ? "Đang gửi..." : "Gửi lại mã"}
                </button>
              </div>
              
              <p style={{ fontSize: '14px', color: '#666', textAlign: 'center', marginTop: '10px' }}>
                Mã xác nhận có 6 chữ số. Nếu không thấy email, vui lòng kiểm tra thư mục spam.
              </p>
            </>
          )}
        </div>
        
        <div className="signup2-image">
          {/* The image will be loaded via CSS background */}
        </div>
      </div>
    </div>
  );
};

export default SignUp2;