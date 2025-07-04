/* eslint-disable no-undef */
/* eslint-disable no-console */
import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
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
      logout();
    };

    window.addEventListener('auth:logout', handleLogout);

    return () => {
      window.removeEventListener('auth:logout', handleLogout);
    };
  }, []);

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        debugLog('No token found in localStorage');
        setIsAuthenticated(false);
        setUser(null);
        setLoading(false);
        return false;
      }

      debugLog('Token found, verifying with server...');
      // Verify token and get user data
      const verifiedUserData = await authService.verifyToken();

      debugLog('Token verification successful:', verifiedUserData);
      setUser(verifiedUserData);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(verifiedUserData));
      return true;
    } catch (error) {
      debugLog('Auth verification failed:', error.message);
      authService.clearTokens();
      setUser(null);
      setIsAuthenticated(false);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const login = async (userNameOrEmail, password) => {
    try {
      debugLog('Login attempt for:', userNameOrEmail);
      const result = await authService.login(userNameOrEmail, password);

      if (result.success) {
        debugLog('Login successful:', result.user);
        const { user: userData, access_token, refresh_token } = result;
        localStorage.setItem('access_token', access_token);
        if (refresh_token) localStorage.setItem('refresh_token', refresh_token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        debugLog('Login failed:', result.message);
        return { success: false, message: result.message };
      }
    } catch (error) {
      debugLog('Login error:', error.message);
      return {
        success: false,
        message: error.message || 'Đăng nhập thất bại',
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
        message: error.message || 'Đăng ký thất bại',
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
      // Clear local data regardless of server response
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
      debugLog('User state and localStorage cleared');
    }
  };

  const updateUser = async (updatedUserData, updateRole = false) => {
    try {
      debugLog('Updating user data:', updatedUserData);

      if (updateRole && updatedUserData.role) {
        debugLog('Updating user role:', updatedUserData.role);
        // Call API to update role
        const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/update-role`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
          body: JSON.stringify({ role: updatedUserData.role }),
        });

        if (!response.ok) {
          throw new Error('Failed to update role');
        }
      }

      // Merge new data with existing user data
      const newUserData = {
        ...user,
        ...updatedUserData,
        id: user?.id || updatedUserData?.id,
        username: user?.username || updatedUserData?.username,
        email: user?.email || updatedUserData?.email,
        role: user?.role || updatedUserData?.role,
      };

      // Update state and localStorage
      setUser(newUserData);
      localStorage.setItem('user', JSON.stringify(newUserData));
      debugLog('User data updated successfully:', newUserData);
      return { success: true, user: newUserData };
    } catch (error) {
      debugLog('Error updating user data:', error.message);
      return { success: false, error: error.message };
    }
  };

  const updateUserRole = async (userData) => {
    try {
      debugLog('Updating user role:', userData);
      
      // Call API to update role and account type
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/update-role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({
          role: userData.role,
          account_type: userData.account_type
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update role');
      }

      const updatedUserData = await response.json();
      
      // Update state and localStorage
      setUser(prevUser => ({
        ...prevUser,
        ...updatedUserData,
        role: userData.role,
        account_type: userData.account_type
      }));
      
      localStorage.setItem('user', JSON.stringify({
        ...JSON.parse(localStorage.getItem('user')),
        role: userData.role,
        account_type: userData.account_type
      }));
      
      debugLog('User role updated successfully:', updatedUserData);
      
      return { success: true, user: updatedUserData };
    } catch (error) {
      debugLog('Error updating user role:', error.message);
      return { success: false, error: error.message };
    }
  };

  const refreshUserData = async () => {
    try {
      debugLog('Refreshing user data from server...');
      const userData = await authService.verifyToken();
      debugLog('User data refreshed successfully:', userData);
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(userData));
      return { success: true, user: userData };
    } catch (error) {
      debugLog('Error refreshing user data:', error.message);
      setIsAuthenticated(false);
      return { success: false, error: error.message };
    }
  };

  const hasRole = (requiredRole) => {
    if (!user) {
      debugLog('hasRole check failed: no user');
      return false;
    }
    const result = user.role === requiredRole;
    debugLog(`hasRole(${requiredRole}):`, result);
    return result;
  };

  const hasAnyRole = (requiredRoles) => {
    if (!user) {
      debugLog('hasAnyRole check failed: no user');
      return false;
    }
    const result = requiredRoles.includes(user.role);
    debugLog(`hasAnyRole(${requiredRoles}):`, result);
    return result;
  };

  const loginWithGoogle = async () => {
    try {
      debugLog('Initiating Google login...');
      const response = await authService.loginWithGoogle();
      if (response.success) {
        debugLog('Google login successful');
        await checkAuthStatus();
        return { success: true };
      } else {
        debugLog('Google login failed:', response.message);
        return { success: false, message: response.message };
      }
    } catch (error) {
      debugLog('Google login failed:', error);
      return {
        success: false,
        message: 'Đăng nhập Google thất bại'
      };
    }
  };

  const isShop = () => {
    const result = user?.role === 'shop';
    debugLog('isShop:', result);
    return result;
  };

  const isAdmin = () => {
    const result = user?.role === 'admin';
    debugLog('isAdmin:', result);
    return result;
  };

  const isPremium = () => {
    const result = user?.account_type?.level === 'premium' || user?.role === 'shop';
    debugLog('isPremium:', result);
    return result;
  };

  // Quyền theo account_type.type
  const canUseAI = () => user?.account_type?.type >= 2;
  const canPersonalizeReptile = () => user?.account_type?.type >= 2;
  const canSellProduct = () => user?.account_type?.type >= 3;
  const isBuyerOnly = () => user?.account_type?.type === 1;

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    updateUser,
    updateUserRole,
    refreshUserData,
    hasRole,
    hasAnyRole,
    isShop,
    isAdmin,
    isPremium,
    checkAuthStatus,
    loginWithGoogle,
    // Thêm các hàm phân quyền mới
    canUseAI,
    canPersonalizeReptile,
    canSellProduct,
    isBuyerOnly,
  };

  debugLog('AuthProvider rendering with user:', user ? user.username : 'null');

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};