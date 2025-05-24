import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/SignUp2.css";

const SignUp2 = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [enteredCode, setEnteredCode] = useState("");
  const [showVerification, setShowVerification] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Generate a random 6-digit verification code
  useEffect(() => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setVerificationCode(code);
  }, []);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError("Please enter your email address");
      return;
    }
    
    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Check if email already exists in backend
      const checkResponse = await fetch(`http://localhost:8080/reptitist/auth/check-email?email=${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const checkData = await checkResponse.json();
      
      if (checkResponse.status === 409) {
        setError("This email is already registered. Please use a different email or login.");
        setIsSubmitting(false);
        return;
      }
      
      // Simulate sending verification code via EmailJS
      // In a real application, you would use EmailJS API here
      console.log(`Sending verification code ${verificationCode} to ${email}`);
      
      // For demo purposes, we'll just show the verification code in the console
      // and proceed to the verification step
      alert(`For demo purposes, your verification code is: ${verificationCode}`);
      
      setShowVerification(true);
      setError("");
      
    } catch (error) {
      console.error("Error checking email:", error);
      setError("Something went wrong. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerificationSubmit = (e) => {
    e.preventDefault();
    
    if (!enteredCode) {
      setError("Please enter the verification code");
      return;
    }
    
    if (enteredCode === verificationCode) {
      // Verification successful, proceed to SignUp3
      navigate('/SignUp3', { state: { email } });
    } else {
      setError("Invalid verification code. Please try again.");
    }
  };

  return (
    <div className="signup2-body">
      <div className="signup2-container">
        <div className="signup2-content">
          <div className="signup2-logo">
            <img src="/logo1.png" alt="Reptisist Logo" />
          </div>
          
          <h1 className="signup2-headline">
            {showVerification 
              ? "Verify Your Email" 
              : "Cùng chúng tôi chăm sóc bò sát theo cách chuyên nghiệp"}
          </h1>
          
          <p className="signup2-subheadline">
            {showVerification 
              ? "We've sent a verification code to your email. Please enter it below to continue." 
              : "Website chăm sóc bò sát cung cấp Chatbot AI 24/7, thư viện kiến thức phong phú, hỏi đáp cá nhân hóa, và kết nối cộng đồng giúp bạn chăm sóc bò sát dễ dàng."}
          </p>
          
          {error && <div className="signup2-error">{error}</div>}
          
          {!showVerification ? (
            <form onSubmit={handleEmailSubmit}>
              <div className="signup2-input-wrapper">
                <input 
                  type="email" 
                  placeholder="Nhập địa chỉ Email của bạn!" 
                  className="signup2-email-input"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  required
                />
              </div>
              
              <button 
                type="submit" 
                className="signup2-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Đang xử lý..." : "Đăng ký ngay!"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerificationSubmit}>
              <div className="signup2-input-wrapper">
                <input 
                  type="text" 
                  placeholder="Enter verification code" 
                  className="signup2-email-input"
                  value={enteredCode}
                  onChange={(e) => {
                    setEnteredCode(e.target.value);
                    setError("");
                  }}
                  required
                />
              </div>
              
              <button type="submit" className="signup2-button">
                Verify
              </button>
            </form>
          )}
          
          <div className="signup2-terms">
            By continuing, you agree to our{" "}
            <a href="#">Terms of Service</a> and{" "}
            <a href="#">Privacy Policy</a>, including the use of{" "}
            <a href="#">Cookies</a>.
          </div>
        </div>
        
        <div className="signup2-image">
          {/* Image is loaded via CSS background */}
        </div>
      </div>
    </div>
  );
};

export default SignUp2;