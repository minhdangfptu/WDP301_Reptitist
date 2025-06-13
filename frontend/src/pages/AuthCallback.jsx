import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthCallback = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { checkAuthStatus } = useAuth();

    useEffect(() => {
        const handleCallback = async () => {
            const params = new URLSearchParams(location.search);
            const accessToken = params.get('access_token');
            const refreshToken = params.get('refresh_token');
            const error = params.get('error');

            if (error) {
                console.error('Authentication error:', error);
                navigate('/login?error=' + error);
                return;
            }

            if (accessToken && refreshToken) {
                // Store tokens
                localStorage.setItem('token', accessToken);
                localStorage.setItem('refreshToken', refreshToken);

                // Verify authentication
                await checkAuthStatus();
                navigate('/');
            } else {
                navigate('/login?error=No tokens received');
            }
        };

        handleCallback();
    }, [location, navigate, checkAuthStatus]);

    return (
        <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100vh',
            fontSize: '1.2rem'
        }}>
            <img src = "loading.gif"></img>
            Đang xử lý đăng nhập...
        </div>
    );
};

export default AuthCallback; 