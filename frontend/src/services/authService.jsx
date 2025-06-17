import axios from 'axios';
import { baseUrl } from '../config';

const API_BASE_URL = baseUrl;

class AuthService {
  // Login method
  async login(username, password) {
    try {
      const response = await axios.post(`${API_BASE_URL}/reptitist/auth/login`, {
        username,
        password
      });
      
      const { access_token, refresh_token, user: userData } = response.data;
      
      // Store tokens and user data
      this.setTokens(access_token, refresh_token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      return { success: true, user: userData, access_token, refresh_token };
    } catch (error) {
      const message = error.response?.data?.message || 'Đăng nhập thất bại';
      return { success: false, message };
    }
  }

  // Register method
  async register(userData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/reptitist/auth/signup`, {
        username: userData.username,
        email: userData.email,
        password: userData.password
      });
      
      return { success: true, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.message || 'Đăng ký thất bại';
      return { success: false, message };
    }
  }

  // Verify token and get user profile
  async verifyToken() {
    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        throw new Error('No token found');
      }

      const response = await axios.get(`${API_BASE_URL}/reptitist/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Token verification failed');
    }
  }

  // Logout method
  async logout() {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (refreshToken) {
        await axios.post(`${API_BASE_URL}/reptitist/auth/logout`, {
          refresh_token: refreshToken
        });
      }
    } catch (error) {
      console.warn('Logout request failed:', error.message);
    } finally {
      this.clearTokens();
    }
  }

  async loginWithGoogle() {
    try {
      // Redirect to Google OAuth endpoint
      window.location.href = `${API_BASE_URL}/reptitist/auth/google`;
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Google login failed';
      return { success: false, message };
    }
  }

  // Refresh access token
  async refreshAccessToken() {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await axios.post(`${API_BASE_URL}/reptitist/auth/refresh-token`, {
        refresh_token: refreshToken
      });

      const newAccessToken = response.data.access_token;
      
      if (newAccessToken) {
        localStorage.setItem('access_token', newAccessToken);
        return newAccessToken;
      } else {
        throw new Error('No access token in response');
      }
    } catch (error) {
      this.clearTokens();
      throw new Error('Token refresh failed');
    }
  }

  // Set tokens in localStorage
  setTokens(accessToken, refreshToken) {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  }

  // Clear all auth data
  clearTokens() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }

  // Get current token
  getToken() {
    return localStorage.getItem('access_token');
  }

  // Get refresh token
  getRefreshToken() {
    return localStorage.getItem('refresh_token');
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = this.getToken();
    const user = localStorage.getItem('user');
    return !!(token && user);
  }

  // Get user from localStorage
  getCurrentUser() {
    try {
      const userString = localStorage.getItem('user');
      return userString ? JSON.parse(userString) : null;
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      return null;
    }
  }
}

// Export singleton instance
const authService = new AuthService();
export default authService;