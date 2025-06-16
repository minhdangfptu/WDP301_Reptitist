import axios from 'axios';

const baseUrl = import.meta.env.VITE_BACKEND_URL;

class AuthService {
  // Login method
  async login(username, password) {
    try {
      const response = await axios.post(`${baseUrl}/reptitist/auth/login`, {
        username,
        password
      });
      
      const { access_token, refresh_token, user: userData } = response.data;
      
      // Store tokens and user data
      this.setTokens(access_token, refresh_token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      return { success: true, user: userData };
    } catch (error) {
      const message = error.response?.data?.message || 'Đăng nhập thất bại';
      return { success: false, message };
    }
  }

  // Register method
  async register(userData) {
    try {
      const response = await axios.post(`${baseUrl}/reptitist/auth/signup`, {
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
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No token found');
      }

      const response = await axios.get(`${baseUrl}/reptitist/auth/profile`, {
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
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (refreshToken) {
        await axios.post(`${baseUrl}/reptitist/auth/logout`, {
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
      window.location.href = `${baseUrl}/reptitist/auth/google`;
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Google login failed';
      return { success: false, message };
    }
  }

  // Refresh access token
  async refreshAccessToken() {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

        const response = await axios.post(`${baseUrl}/reptitist/auth/refresh-token`, {
        refresh_token: refreshToken
      });

      const newAccessToken = response.data.access_token;
      
      if (newAccessToken) {
        localStorage.setItem('token', newAccessToken);
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
    localStorage.setItem('token', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  // Clear all auth data
  clearTokens() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  // Get current token
  getToken() {
    return localStorage.getItem('token');
  }

  // Get refresh token
  getRefreshToken() {
    return localStorage.getItem('refreshToken');
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