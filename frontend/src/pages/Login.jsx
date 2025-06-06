import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../css/Login.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const togglePassword = () => setShowPassword(prev => !prev);

    // Handle login form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Clear previous errors
        setError(null);
        
        // Validate inputs
        if (!userName.trim()) {
            setError('Vui lòng nhập tên đăng nhập');
            return;
        }
        
        if (!password.trim()) {
            setError('Vui lòng nhập mật khẩu');
            return;
        }

        setIsLoading(true);

        try {
            console.log('Starting login process...');
            
            // Use AuthContext login function
            const result = await login(userName.trim(), password);
            
            console.log('Login result:', result);

            if (result.success) {
                // Show success message
                toast.success('Đăng nhập thành công!', {
                    position: "top-right",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true
                });

                // Small delay to show success message before redirect
                setTimeout(() => {
                    console.log('Redirecting to home page...');
                    navigate('/');
                }, 1000);

            } else {
                console.log('Login failed:', result.message);
                setError(result.message);
                toast.error(result.message, {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true
                });
            }

        } catch (err) {
            console.error('Login error:', err);
            const errorMessage = 'Đã xảy ra lỗi. Vui lòng thử lại.';
            setError(errorMessage);
            toast.error(errorMessage, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="login-body">
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
            
            <div className="login-container">
                <div className="bg-image"></div>
                <div className="login-content">
                    {/* Phần đăng nhập gần đây */}
                    <div className="recent-logins">
                        <div className="logo">
                            <img
                                src="../public/logo1.png"
                                alt="Reptisist Logo"
                            />
                        </div>

                        <h2 className="recent-title">Đăng nhập gần đây</h2>
                        <p className="recent-subtitle">Bấm vào ảnh của bạn để tiếp tục</p>

                        <div className="accounts-container">
                            <div className="account-card">
                                <div className="account-image">
                                    <img src="/api/placeholder/90/90" alt="Mạnh Định" />
                                </div>
                                <p className="account-name">Mạnh Định</p>
                            </div>

                            <div className="account-card">
                                <div className="create-account">
                                    <span className="plus-icon">+</span>
                                </div>
                                <p className="account-name">Tạo tài khoản</p>
                            </div>
                        </div>

                        <div>
                            <p className="login-instructions">
                                Nếu chưa có tài khoản, hãy{' '}
                                <a href="/SignUp" className="signup-link">
                                    đăng kí
                                </a>
                                !
                            </p>
                        </div>
                    </div>

                    {/* Phần form đăng nhập */}
                    <form className="login-form" onSubmit={handleSubmit}>
                        <h1 className="login-title">ĐĂNG NHẬP</h1>
                        
                        {/* Display error message */}
                        {error && (
                            <div className="error-message" style={{
                                backgroundColor: '#f8d7da',
                                color: '#721c24',
                                padding: '10px',
                                borderRadius: '4px',
                                marginBottom: '15px',
                                border: '1px solid #f5c6cb',
                                fontSize: '14px'
                            }}>
                                {error}
                            </div>
                        )}

                        <div className="input-group">
                            <span className="input-icon">
                                <i className="fa-solid fa-user"></i>
                            </span>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Nhập tên đăng nhập"
                                required
                                value={userName}
                                onChange={(e) => {
                                    setUserName(e.target.value);
                                    if (error) setError(null); // Clear error when user types
                                }}
                                disabled={isLoading}
                            />
                        </div>

                        <div className="input-group">
                            <span className="input-icon">
                                <i className="fa-solid fa-lock"></i>
                            </span>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="form-input"
                                placeholder="Nhập mật khẩu"
                                required
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    if (error) setError(null); // Clear error when user types
                                }}
                                disabled={isLoading}
                            />
                            <i
                                className={`password-toggle fa-regular ${showPassword ? 'fa-eye-slash' : 'fa-eye'
                                    }`}
                                onClick={togglePassword}
                                style={{ 
                                    userSelect: 'none',
                                    cursor: isLoading ? 'not-allowed' : 'pointer',
                                    opacity: isLoading ? 0.5 : 1
                                }}
                            ></i>
                        </div>

                        <div className="forgot-password">
                            <a href="#">Quên mật khẩu?</a>
                        </div>

                        <button 
                            type='submit' 
                            className="login-btn"
                            disabled={isLoading}
                            style={{
                                opacity: isLoading ? 0.7 : 1,
                                cursor: isLoading ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {isLoading ? 'ĐANG ĐĂNG NHẬP...' : 'ĐĂNG NHẬP'}
                        </button>

                        <div className="divider">HOẶC</div>

                        <a href="#" className="social-login-btn">
                            <span className="google-icon">
                                <img
                                    src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
                                    alt="Google"
                                />
                            </span>
                            Đăng nhập sử dụng Google
                        </a>

                        <a href="#" className="social-login-btn">
                            <span className="facebook-icon">
                                <img
                                    src="https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png"
                                    alt="Facebook"
                                />
                            </span>
                            Đăng nhập sử dụng Facebook
                        </a>

                        <div className="terms">
                            Bằng cách tiếp tục, bạn đồng ý với{' '}
                            <a href="#">Điều khoản sử dụng</a> và{' '}
                            <a href="#">Chính sách bảo mật</a>, bao gồm việc sử dụng{' '}
                            <a href="#">Cookies</a>.
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login;