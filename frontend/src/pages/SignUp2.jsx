import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../css/SignUp2.css';

const SignUp2 = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { register } = useAuth();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validate form
        if (formData.password !== formData.confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            return;
        }

        if (formData.password.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }

        setLoading(true);

        try {
            const result = await register({
                name: formData.name,
                email: formData.email,
                password: formData.password
            });

            if (result.success) {
                // Chuyển hướng đến trang SignUp3 với email đã đăng ký
                navigate('/SignUp3', { 
                    state: { 
                        email: formData.email,
                        verified: true 
                    } 
                });
            } else {
                setError(result.message || 'Đã xảy ra lỗi khi đăng ký');
            }
        } catch (err) {
            setError('Đã xảy ra lỗi khi đăng ký');
            console.error('Registration error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="signup2-body">
            <div className="signup2-container">
                <div className="signup2-content">
                    <div className="logo">
                        <img src="../public/logo1.png" alt="Reptisist Logo" />
                    </div>

                    <h1 className="signup2-title">ĐĂNG KÝ TÀI KHOẢN</h1>

                    {error && <div className="error-message">{error}</div>}

                    <form onSubmit={handleSubmit} className="signup2-form">
                        <div className="input-group">
                            <span className="input-icon">
                                <i className="fa-solid fa-user"></i>
                            </span>
                            <input
                                type="text"
                                name="name"
                                className="form-input"
                                placeholder="Họ và tên"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <span className="input-icon">
                                <i className="fa-solid fa-envelope"></i>
                            </span>
                            <input
                                type="email"
                                name="email"
                                className="form-input"
                                placeholder="Email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <span className="input-icon">
                                <i className="fa-solid fa-lock"></i>
                            </span>
                            <input
                                type="password"
                                name="password"
                                className="form-input"
                                placeholder="Mật khẩu"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <span className="input-icon">
                                <i className="fa-solid fa-lock"></i>
                            </span>
                            <input
                                type="password"
                                name="confirmPassword"
                                className="form-input"
                                placeholder="Xác nhận mật khẩu"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <button 
                            type="submit" 
                            className="signup2-btn"
                            disabled={loading}
                        >
                            {loading ? 'ĐANG XỬ LÝ...' : 'ĐĂNG KÝ'}
                        </button>
                    </form>

                    <div className="login-link">
                        Đã có tài khoản? <a href="/Login">Đăng nhập</a>
                    </div>

                    <div className="terms">
                        Bằng cách đăng ký, bạn đồng ý với{' '}
                        <a href="#">Điều khoản sử dụng</a> và{' '}
                        <a href="#">Chính sách bảo mật</a> của chúng tôi.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignUp2;
