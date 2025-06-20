import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import "../css/SignUp3.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SignUp3 = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register } = useAuth();
  
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

  useEffect(() => {
    console.log("SignUp3 - Email:", email, "Verified:", isVerified); 
    
    if (!email || !isVerified) {
      toast.error("Vui lòng xác thực email trước khi tiếp tục đăng ký.");
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
    
    // Clear submit error when user makes changes
    if (errors.submit) {
      setErrors({ ...errors, submit: null });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = "Tên người dùng là bắt buộc";
    } else if (formData.username.trim().length < 3) {
      newErrors.username = "Tên người dùng phải có ít nhất 3 ký tự";
    } else if (formData.username.trim().length > 30) {
      newErrors.username = "Tên người dùng không được quá 30 ký tự";
    } else if (!/^[a-zA-Z0-9]+$/.test(formData.username.trim())) {
      newErrors.username = "Tên người dùng chỉ được chứa chữ cái và số";
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = "Mật khẩu là bắt buộc";
    } else if (formData.password.length < 8) {
      newErrors.password = "Mật khẩu phải có ít nhất 8 ký tự";
    } else if (!/(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = "Mật khẩu phải chứa ít nhất 1 chữ hoa và 1 số";
    } else if (formData.password.length > 50) {
      newErrors.password = "Mật khẩu không được quá 50 ký tự";
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
      console.log("Submitting registration with:", {
        username: formData.username.trim(),
        email: email,
        password: formData.password,
      }); // Debug log
      
      // Use the register function from AuthContext
      const result = await register({
        username: formData.username.trim(),
        email: email,
        password: formData.password,
      });
      
      if (result.success) {
        // Registration successful
        toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
        navigate('/Login');
      } else {
        // Registration failed
        if (result.message.includes('Username already exists')) {
          setErrors({ username: "Tên người dùng đã tồn tại" });
        } else if (result.message.includes('Email already exists')) {
          setErrors({ submit: "Email đã được đăng ký" });
        } else if (result.message.includes('Invalid password')) {
          setErrors({ password: "Mật khẩu không hợp lệ" });
        } else {
          setErrors({ submit: result.message || "Đăng ký thất bại. Vui lòng thử lại." });
        }
        toast.error(result.message || "Đăng ký thất bại. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Error during registration:", error);
      setErrors({ 
        submit: error.message || "Lỗi kết nối. Vui lòng kiểm tra kết nối mạng và thử lại." 
      });
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

  // Show loading while checking verification status
  if (!email || !isVerified) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div>⏳ Đang kiểm tra xác thực...</div>
          <div style={{ fontSize: '14px', marginTop: '10px' }}>
            Vui lòng đợi trong giây lát
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="signup3-body">
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <div className="signup3-container">
        <div className="signup3-content">
          <div className="signup3-logo">
            <img src="/logo1.png" alt="Reptisist Logo" />
          </div>
          
          <h1 className="signup3-headline">Hoàn tất đăng ký</h1>
          
          <p className="signup3-subheadline">
            Vui lòng tạo tên người dùng và mật khẩu để hoàn tất việc tạo tài khoản cho email: <strong>{email}</strong>
          </p>
          
          <form className="signup3-form" onSubmit={handleSubmit}>
            <div className="signup3-input-group">
              <label htmlFor="email">Email đã xác thực</label>
              <input 
                type="email" 
                id="email"
                value={email}
                disabled
                className="signup3-input disabled"
                style={{ backgroundColor: '#e8f5e8', color: '#0a5a0a' }}
              />
              <div style={{ fontSize: '12px', color: '#28a745', marginTop: '5px' }}>
                ✓ Email đã được xác thực
              </div>
            </div>
            
            <div className="signup3-input-group">
              <label htmlFor="username">Tên người dùng *</label>
              <input 
                type="text" 
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={`signup3-input ${errors.username ? 'error' : ''}`}
                placeholder="Nhập tên người dùng (3-30 ký tự, chỉ chữ và số)"
                disabled={isSubmitting}
              />
              {errors.username && <div className="error-message">{errors.username}</div>}
            </div>
            
            <div className="signup3-input-group">
              <label htmlFor="password">Mật khẩu *</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`signup3-input ${errors.password ? 'error' : ''}`}
                  placeholder="Nhập mật khẩu (ít nhất 8 ký tự, có chữ hoa và số)"
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
                    color: '#666',
                    fontSize: '16px'
                  }}
                  disabled={isSubmitting}
                >
                  {showPassword ? '👁️‍🗨️' : '👁️'}
                </button>
              </div>
              {errors.password && <div className="error-message">{errors.password}</div>}
            </div>
            
            <div className="signup3-input-group">
              <label htmlFor="confirmPassword">Xác nhận mật khẩu *</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`signup3-input ${errors.confirmPassword ? 'error' : ''}`}
                  placeholder="Nhập lại mật khẩu"
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
                    color: '#666',
                    fontSize: '16px'
                  }}
                  disabled={isSubmitting}
                >
                  {showConfirmPassword ? '👁️‍🗨️' : '👁️'}
                </button>
              </div>
              {errors.confirmPassword && (
                <div className="error-message">{errors.confirmPassword}</div>
              )}
            </div>
            
            {errors.submit && (
              <div className="error-message submit-error" style={{ 
                backgroundColor: '#f8d7da', 
                border: '1px solid #f5c6cb', 
                padding: '10px',
                borderRadius: '5px'
              }}>
                {errors.submit}
              </div>
            )}
            
            <button 
              type="submit" 
              className="signup3-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? "⏳ Đang tạo tài khoản..." : "Hoàn tất đăng ký"}
            </button>
          </form>
          
          <div className="signup3-terms">
            Bằng cách đăng ký, bạn đồng ý với{" "}
            <a href="#" style={{ color: '#0fa958' }}>Điều khoản sử dụng</a> và{" "}
            <a href="#" style={{ color: '#0fa958' }}>Chính sách bảo mật</a> của chúng tôi.
          </div>
        </div>
        
        <div className="signup3-image"></div>
      </div>
    </div>
  );
};

export default SignUp3;