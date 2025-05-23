import React from "react";
import "../css/SignUp2.css";

const SignUp2 = () => {
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
            />
          </div>
          
          <button className="signup2-button">
            Đăng ký ngay!
          </button>
        </div>
        
        <div className="signup2-image">
          {/* The image will be loaded via CSS background */}
        </div>
      </div>
    </div>
  );
};

export default SignUp2;