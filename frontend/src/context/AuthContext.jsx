import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const API_BASE_URL = 'http://localhost:8080/reptitist';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Debug function
  const debugLog = (message, data = '') => {
    console.log(`[AuthContext] ${message}`, data);
  };

  useEffect(() => {
    debugLog('AuthProvider mounted, checking authentication...');
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        debugLog('No token found in localStorage');
        setLoading(false);
        return;
      }

      debugLog('Token found, verifying with server...');
      
      // Verify token and get user data
      const response = await axios.get(`${API_BASE_URL}/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      debugLog('Profile fetched successfully:', response.data);
      setUser(response.data);
      
      // Update localStorage with fresh user data
      localStorage.setItem('user', JSON.stringify(response.data));
      
    } catch (error) {
      debugLog('Auth verification failed:', error.response?.data || error.message);
      
      // Clear invalid auth data
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      debugLog('Login attempt for username:', username);
      
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        username,
        password
      });
      
      const { access_token, refresh_token, user: userData } = response.data;
      
      debugLog('Login successful:', userData);
      
      // Store tokens and user data
      localStorage.setItem('token', access_token);
      localStorage.setItem('refreshToken', refresh_token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Update state immediately
      setUser(userData);
      
      debugLog('User state updated in context');
      
      return { success: true };
    } catch (error) {
      debugLog('Login failed:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 'Đăng nhập thất bại'
      };
    }
  };

  const register = async (userData) => {
    try {
      debugLog('Registration attempt for:', userData.email);
      
      const response = await axios.post(`${API_BASE_URL}/auth/signup`, {
        username: userData.username,
        email: userData.email,
        password: userData.password
      });
      
      debugLog('Registration successful:', response.data);
      
      return { success: true, message: response.data.message };
    } catch (error) {
      debugLog('Registration failed:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 'Đăng ký thất bại'
      };
    }
  };

  const logout = async () => {
    try {
      debugLog('Logout attempt...');
      
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await axios.post(`${API_BASE_URL}/auth/logout`, {
          refresh_token: refreshToken
        });
      }
      
      debugLog('Logout successful');
    } catch (error) {
      debugLog('Logout error:', error.message);
    } finally {
      // Always clear local data regardless of server response
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
      debugLog('User state cleared');
    }
  };

  const updateUser = (updatedUserData) => {
    debugLog('Updating user data:', updatedUserData);
    
    const newUserData = { ...user, ...updatedUserData };
    setUser(newUserData);
    localStorage.setItem('user', JSON.stringify(newUserData));
    
    debugLog('User data updated successfully');
  };

  // Check if user has required role
  const hasRole = (requiredRole) => {
    if (!user) {
      debugLog('hasRole check failed: no user');
      return false;
    }
    const result = user.role === requiredRole;
    debugLog(`hasRole(${requiredRole}):`, result);
    return result;
  };

  // Check if user has any of the required roles
  const hasAnyRole = (requiredRoles) => {
    if (!user) {
      debugLog('hasAnyRole check failed: no user');
      return false;
    }
    const result = requiredRoles.includes(user.role);
    debugLog(`hasAnyRole(${requiredRoles}):`, result);
    return result;
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    hasRole,
    hasAnyRole,
    checkAuthStatus // Expose for manual refresh
  };

  debugLog('AuthProvider rendering with user:', user ? user.username : 'null');

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};