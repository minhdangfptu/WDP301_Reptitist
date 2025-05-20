import React from "react";
import "../css/Signup.css"; 

const Signup = () => {
  return (
    <div className="login-container">
      {/* Nội dung đăng nhập */}
      <div className="login-content">
        <div className="logo">
          <img
            src="Screenshot 2025-05-20 072648.png"
            alt="Reptisist Logo"
          />
        </div>

        <h1 className="headline">
          Cùng chúng tôi chăm sóc bò sát theo cách chuyên nghiệp
        </h1>

        <p className="subheadline">
          Website chăm sóc bò sát cung cấp Chatbot AI 24/7, thư viện kiến thức phong phú, hỏi đáp cá nhân hóa, và kết nối cộng đồng giúp bạn chăm sóc bò sát dễ dàng.
        </p>

        <a href="#" className="social-login-btn">
          <span className="google-icon">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
              alt="Google"
            />
          </span>
          Đăng ký sử dụng Google
        </a>

        <a href="#" className="social-login-btn">
          <span className="facebook-icon">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png"
              alt="Facebook"
            />
          </span>
          Đăng ký sử dụng Facebook
        </a>

        <div className="terms">
          Bằng cách tiếp tục, bạn đồng ý với{" "}
          <a href="#">Điều khoản sử dụng</a> và{" "}
          <a href="#">Chính sách bảo mật</a>, bao gồm việc sử dụng{" "}
          <a href="#">Cookies</a>.
        </div>

        <div className="divider">HOẶC</div>

        <a href="/Login" className="email-btn">
          Tiếp tục với Email
        </a>
      </div>

      {/* Hình ảnh bên phải */}
      <div className="login-image"></div>
    </div>
  );
};

export default Signup;
