import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../css/SignUp3.css";

const SignUp3 = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";
  
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    if (!formData.username) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = "Password must contain at least one uppercase letter and one number";
    }
    
    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
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
    
    try {
      // Send registration data to backend
      const response = await fetch('http://localhost:8080/reptitist/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: email,
          password: formData.password,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Registration successful
        alert("Registration successful! Please log in.");
        navigate('/Login');
      } else {
        // Registration failed
        setErrors({ submit: data.message || "Registration failed. Please try again." });
      }
    } catch (error) {
      console.error("Error during registration:", error);
      setErrors({ submit: "Network error. Please try again later." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="signup3-body">
      <div className="signup3-container">
        <div className="signup3-content">
          <div className="signup3-logo">
            <img src="/logo1.png" alt="Reptisist Logo" />
          </div>
          
          <h1 className="signup3-headline">Complete Your Registration</h1>
          
          <p className="signup3-subheadline">
            Please create a username and password to complete your account setup.
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
              <label htmlFor="username">Username</label>
              <input 
                type="text" 
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={`signup3-input ${errors.username ? 'error' : ''}`}
                placeholder="Create a username"
              />
              {errors.username && <div className="error-message">{errors.username}</div>}
            </div>
            
            <div className="signup3-input-group">
              <label htmlFor="password">Password</label>
              <input 
                type="password" 
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`signup3-input ${errors.password ? 'error' : ''}`}
                placeholder="Create a password"
              />
              {errors.password && <div className="error-message">{errors.password}</div>}
            </div>
            
            <div className="signup3-input-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input 
                type="password" 
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`signup3-input ${errors.confirmPassword ? 'error' : ''}`}
                placeholder="Confirm your password"
              />
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
              {isSubmitting ? "Creating Account..." : "Complete Registration"}
            </button>
          </form>
          
          <div className="signup3-terms">
            By registering, you agree to our{" "}
            <a href="#">Terms of Service</a> and{" "}
            <a href="#">Privacy Policy</a>.
          </div>
        </div>
        
        <div className="signup3-image"></div>
      </div>
    </div>
  );
};

export default SignUp3;