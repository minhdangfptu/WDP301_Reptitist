import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';

const AuthCallback = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { checkAuthStatus } = useAuth();

    useEffect(() => {
        const handleCallback = async () => {
            try {
                console.log('Starting auth callback handling...');
                const params = new URLSearchParams(location.search);
                const accessToken = params.get('access_token');
                const refreshToken = params.get('refresh_token');
                const error = params.get('error');

                console.log('Received params:', {
                    hasAccessToken: !!accessToken,
                    hasRefreshToken: !!refreshToken,
                    error
                });

                if (error) {
                    console.error('Authentication error:', error);
                    navigate('/login?error=' + error);
                    return;
                }

                if (!accessToken || !refreshToken) {
                    console.error('No tokens received');
                    navigate('/login?error=No tokens received');
                    return;
                }

                console.log('Storing tokens...');
                // Store tokens with the correct keys that match AuthContext
                localStorage.setItem('access_token', accessToken);
                localStorage.setItem('refresh_token', refreshToken);

                console.log('Verifying authentication...');
                // Verify authentication
                const result = await checkAuthStatus();
                console.log('Auth verification result:', result);

                if (result) {
                    console.log('Authentication successful, redirecting to home...');
                    navigate('/');
                } else {
                    console.error('Authentication verification failed');
                    navigate('/login?error=Authentication verification failed');
                }
            } catch (error) {
                console.error('Auth callback error:', error);
                navigate('/login?error=' + (error.message || 'Authentication failed'));
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
            <img src="/loading.gif" alt="Loading..." />
            Đang xử lý đăng nhập...
        </div>
    );
};

export default AuthCallback; 