import React from "react";
import "../css/SignUp.css";

const Signup = () => {
  return (
    <div className="signup-body">
      <div className="signup-container">
        {/* Nội dung đăng ký */}
        <div className="signup-content">
          <div className="logo">
            <img src="/logo1.png" alt="Reptisist Logo" />
          </div>

          <h1 className="headline">
            Cùng chúng tôi chăm sóc bò sát theo cách chuyên nghiệp
          </h1>

          <p className="subheadline">
            Website chăm sóc bò sát cung cấp Chatbot AI 24/7, thư viện kiến thức
            phong phú, hỏi đáp cá nhân hóa, và kết nối cộng đồng giúp bạn chăm
            sóc bò sát dễ dàng.
          </p>
          <button
            className="social-login-btn"
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
          <div className="divider" style = {{paddingBottom: "10px"}}>HOẶC</div>

          <a  href="/SignUp2" className="email-signup-btn">
            Tiếp tục với Email
          </a>
          <div className="terms">
            Bằng cách tiếp tục, bạn đồng ý với{" "}
            <a href="/policy-terms">Điều khoản sử dụng</a> và{" "}
            <a href="/policy-terms">Chính sách bảo mật</a>, bao gồm việc sử dụng{" "}
            <a href="/policy-terms">Cookies</a>.
          </div>
        </div>

        {/* Hình ảnh bên phải */}
        <div className="signup-image"></div>
      </div>
    </div>
  );
};

export default Signup;