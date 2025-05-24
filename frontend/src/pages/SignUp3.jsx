import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../css/SignUp3.css";

const SignUp3 = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if user came from SignUp2 with verified email
  const email = location.state?.email || "";
  const isVerified = location.state?.verified || false;
  
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Redirect if not verified or no email
  useEffect(() => {
    if (!email || !isVerified) {
      navigate('/SignUp2');
    }
  }, [email, isVerified, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = "Tên người dùng là bắt buộc";
    } else if (formData.username.length < 3) {
      newErrors.username = "Tên người dùng phải có ít nhất 3 ký tự";
    } else if (formData.username.length > 30) {
      newErrors.username = "Tên người dùng không được quá 30 ký tự";
    } else if (!/^[a-zA-Z0-9]+$/.test(formData.username)) {
      newErrors.username = "Tên người dùng chỉ được chứa chữ cái và số";
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = "Mật khẩu là bắt buộc";
    } else if (formData.password.length < 8) {
      newErrors.password = "Mật khẩu phải có ít nhất 8 ký tự";
    } else if (!/(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = "Mật khẩu phải chứa ít nhất 1 chữ hoa và 1 số";
    }
    
    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setErrors({});
    
    try {
      // Send registration data to backend
      const response = await fetch('http://localhost:8080/reptitist/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username.trim(),
          email: email,
          password: formData.password,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Registration successful
        alert("Đăng ký thành công! Vui lòng đăng nhập.");
        navigate('/Login');
      } else {
        // Registration failed
        if (response.status === 400 && data.message.includes('Username already exists')) {
          setErrors({ username: "Tên người dùng đã tồn tại" });
        } else if (response.status === 400 && data.message.includes('Email already exists')) {
          setErrors({ submit: "Email đã được đăng ký" });
        } else {
          setErrors({ submit: data.message || "Đăng ký thất bại. Vui lòng thử lại." });
        }
      }
    } catch (error) {
      console.error("Error during registration:", error);
      setErrors({ submit: "Lỗi kết nối. Vui lòng thử lại sau." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    if (field === 'password') {
      setShowPassword(!showPassword);
    } else if (field === 'confirmPassword') {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  if (!email || !isVerified) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px'
      }}>
        Đang chuyển hướng...
      </div>
    );
  }

  return (
    <div className="signup3-body">
      <div className="signup3-container">
        <div className="signup3-content">
          <div className="signup3-logo">
            <img src="/logo1.png" alt="Reptisist Logo" />
          </div>
          
          <h1 className="signup3-headline">Hoàn tất đăng ký</h1>
          
          <p className="signup3-subheadline">
            Vui lòng tạo tên người dùng và mật khẩu để hoàn tất việc tạo tài khoản của bạn.
          </p>
          
          <form className="signup3-form" onSubmit={handleSubmit}>
            <div className="signup3-input-group">
              <label htmlFor="email">Email</label>
              <input 
                type="email" 
                id="email"
                value={email}
                disabled
                className="signup3-input disabled"
              />
            </div>
            
            <div className="signup3-input-group">
              <label htmlFor="username">Tên người dùng</label>
              <input 
                type="text" 
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={`signup3-input ${errors.username ? 'error' : ''}`}
                placeholder="Tạo tên người dùng"
                disabled={isSubmitting}
              />
              {errors.username && <div className="error-message">{errors.username}</div>}
            </div>
            
            <div className="signup3-input-group">
              <label htmlFor="password">Mật khẩu</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`signup3-input ${errors.password ? 'error' : ''}`}
                  placeholder="Tạo mật khẩu"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('password')}
                  style={{
                    position: 'absolute',
                    right: '15px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#666'
                  }}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.password && <div className="error-message">{errors.password}</div>}
            </div>
            
            <div className="signup3-input-group">
              <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`signup3-input ${errors.confirmPassword ? 'error' : ''}`}
                  placeholder="Xác nhận mật khẩu"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirmPassword')}
                  style={{
                    position: 'absolute',
                    right: '15px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#666'
                  }}
                >
                  {showConfirmPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.confirmPassword && (
                <div className="error-message">{errors.confirmPassword}</div>
              )}
            </div>
            
            {errors.submit && <div className="error-message submit-error">{errors.submit}</div>}
            
            <button 
              type="submit" 
              className="signup3-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang tạo tài khoản..." : "Hoàn tất đăng ký"}
            </button>
          </form>
          
          <div className="signup3-terms">
            Bằng cách đăng ký, bạn đồng ý với{" "}
            <a href="#">Điều khoản sử dụng</a> và{" "}
            <a href="#">Chính sách bảo mật</a> của chúng tôi.
          </div>
        </div>
        
        <div className="signup3-image"></div>
      </div>
    </div>
  );
};

export default SignUp3;