import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

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

    // Listen for logout events from axios interceptor
    const handleLogout = () => {
      debugLog('Received logout event from axios interceptor');
      setUser(null);
    };

    window.addEventListener('auth:logout', handleLogout);

    return () => {
      window.removeEventListener('auth:logout', handleLogout);
    };
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
      const userData = await authService.verifyToken();
      
      debugLog('Token verification successful:', userData);
      setUser(userData);
      
      // Update localStorage with fresh user data
      localStorage.setItem('user', JSON.stringify(userData));
      
    } catch (error) {
      debugLog('Auth verification failed:', error.message);
      
      // Clear invalid auth data
      authService.clearTokens();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      debugLog('Login attempt for username:', username);
      
      const result = await authService.login(username, password);
      
      if (result.success) {
        debugLog('Login successful:', result.user);
        setUser(result.user);
        return { success: true };
      } else {
        debugLog('Login failed:', result.message);
        return { success: false, message: result.message };
      }
    } catch (error) {
      debugLog('Login error:', error.message);
      return {
        success: false,
        message: error.message || 'Đăng nhập thất bại'
      };
    }
  };

  const register = async (userData) => {
    try {
      debugLog('Registration attempt for:', userData.email);
      
      const result = await authService.register(userData);
      
      debugLog('Registration result:', result.success ? 'success' : result.message);
      return result;
    } catch (error) {
      debugLog('Registration error:', error.message);
      return {
        success: false,
        message: error.message || 'Đăng ký thất bại'
      };
    }
  };

  const logout = async () => {
    try {
      debugLog('Logout attempt...');
      
      await authService.logout();
      
      debugLog('Logout successful');
    } catch (error) {
      debugLog('Logout error:', error.message);
    } finally {
      // Always clear local data regardless of server response
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
    checkAuthStatus
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