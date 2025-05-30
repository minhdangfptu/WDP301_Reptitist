import React, { useState } from 'react';
import '../css/Login.css';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginSuccess } from '../features/auth/authSlice';
import {  loginApi } from '../api/auth';
import { toast } from 'react-toastify';


const Login = () => {
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(null);


    const dispatch = useDispatch();
    const navigate = useNavigate();

    const togglePassword = () => setShowPassword(prev => !prev);

    // Handle login form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await loginApi(userName, password);
            const { token, refresh_token, user } = response.data;

            // Save token to local storage
            localStorage.setItem('token', token);
            localStorage.setItem('refresh_token', refresh_token);
            // Dispatch login action
            dispatch(loginSuccess({ token, user }));
            setTimeout(() => toast.success('Đăng nhập thành công!'), 500);
            // Redirect to home page
            navigate('/LandingPage');

        } catch (err) {
            console.error(err);
            toast.error(err.message || 'Đăng nhập thất bại!');
            setError('Tên đăng nhập hoặc mật khẩu không chính xác!');
        }
    }

    return (
        <div className="login-body">
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

                        {/*Display error message */}
                        {error && <div className="login-error">{error}</div>}

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
                                onChange={(e) => setUserName(e.target.value)}
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
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <i
                                className={`password-toggle fa-regular ${showPassword ? 'fa-eye-slash' : 'fa-eye'
                                    }`}
                                onClick={togglePassword}
                                style={{ userSelect: 'none' }}
                            ></i>
                        </div>

                        <div className="forgot-password">
                            <a href="#">Quên mật khẩu?</a>
                        </div>

                        <button type='submit' className="login-btn">ĐĂNG NHẬP</button>

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