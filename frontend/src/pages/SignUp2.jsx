import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import emailjs from "emailjs-com"; // Import EmailJS
import "../css/SignUp2.css";

const SignUp2 = () => {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [verificationCode, setVerificationCode] = useState(""); // Mã xác nhận tạm thời
  const [isRegistered, setIsRegistered] = useState(false);
  const [message, setMessage] = useState(""); // Thông báo gửi mã xác nhận
  const navigate = useNavigate();

  // Hàm gửi mã xác nhận qua Email
  const sendVerificationCode = (userEmail) => {
    const codeGenerated = Math.floor(100000 + Math.random() * 900000); // Tạo mã xác nhận 6 chữ số ngẫu nhiên
    setVerificationCode(codeGenerated); // Lưu mã xác nhận tạm thời

    const templateParams = {
      user_name: "Nguyễn Văn A",  // Tên người nhận (có thể thay thế tùy theo yêu cầu)
      verification_code: codeGenerated, // Mã xác nhận
      to_email: userEmail,             // Địa chỉ email người nhận (email người dùng nhập)
    };

    emailjs.send(
      "service_llx7onu", // Service ID của bạn
      "template_dd8viae", // Template ID của bạn
      templateParams,
      "qOVKbEY7rEG5Dhe6D" // User ID của bạn (public key)
    )
    .then((response) => {
      console.log("Mã xác nhận đã được gửi thành công!", response);
      setMessage("Mã xác nhận đã được gửi tới email của bạn.");
    })
    .catch((error) => {
      console.log("Có lỗi xảy ra khi gửi email:", error);
      setMessage("Đã xảy ra lỗi khi gửi mã xác nhận.");
    });
  };

  const handleSignUpClick = () => {
    if (email) {
      setShowCodeInput(true);
      setIsRegistered(true);
      sendVerificationCode(email); // Gửi mã qua email khi người dùng đăng ký
    }
  };

  const handleVerifyCode = () => {
    if (code === verificationCode.toString()) {
      navigate("/SignUp3");
    } else {
      alert("Mã xác nhận không đúng!");
    }
  };

  return (
    <div className="signup2-body">
      <div className="signup2-container">
        <div className="signup2-content">
          <div className="signup2-logo">
            <img src="/assets/reptisist-logo.png" alt="Reptisist Logo" />
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
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Hiển thị nút đăng ký chỉ khi chưa đăng ký */}
          {!isRegistered && (
            <button className="signup2-button" onClick={handleSignUpClick}>
              Đăng ký ngay!
            </button>
          )}
          
          {/* Hiển thị thông báo về việc gửi mã xác nhận */}
          {message && <p className="signup2-message">{message}</p>}

          {/* Hiển thị trường nhập mã xác nhận nếu cần */}
          {showCodeInput && (
            <>
              <div className="signup2-input-wrapper">
                <input
                  type="text"
                  placeholder="Nhập mã xác nhận"
                  className="signup2-email-input"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
              </div>
              <button className="signup2-button" onClick={handleVerifyCode}>
                Đăng nhập với mã xác nhận
              </button>
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
