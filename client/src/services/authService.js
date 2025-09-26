const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

class AuthService {
  constructor() {
    this.baseUrl = `${API_BASE_URL}/api/auth`;
  }

  // Get auth token from localStorage
  getToken() {
    return localStorage.getItem('authToken');
  }

  // Set auth token in localStorage
  setToken(token) {
    localStorage.setItem('authToken', token);
  }

  // Remove auth token from localStorage
  removeToken() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
  }

  // Get current user from localStorage
  getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  }

  // Set current user in localStorage
  setCurrentUser(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = this.getToken();
    const user = this.getCurrentUser();
    return !!(token && user);
  }

  // Register new user
  async register(userData) {
    try {
      const response = await fetch(`${this.baseUrl}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Store token and user data
      this.setToken(data.token);
      this.setCurrentUser(data.user);

      return data;
    } catch (error) {
      throw new Error(error.message || 'Registration failed');
    }
  }

  // Login user
  async login(credentials) {
    try {
      const response = await fetch(`${this.baseUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Store token and user data
      this.setToken(data.token);
      this.setCurrentUser(data.user);

      return data;
    } catch (error) {
      throw new Error(error.message || 'Login failed');
    }
  }

  // Logout user
  async logout() {
    try {
      const token = this.getToken();
      
      if (token) {
        await fetch(`${this.baseUrl}/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local storage
      this.removeToken();
    }
  }

  // Get user profile
  async getProfile() {
    try {
      const token = this.getToken();
      if (!token) throw new Error('No auth token found');

      const response = await fetch(`${this.baseUrl}/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          this.removeToken();
        }
        throw new Error(data.error || 'Failed to fetch profile');
      }

      this.setCurrentUser(data.user);
      return data.user;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch profile');
    }
  }

  // Update user profile
  async updateProfile(profileData) {
    try {
      const token = this.getToken();
      if (!token) throw new Error('No auth token found');

      const response = await fetch(`${this.baseUrl}/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          this.removeToken();
        }
        throw new Error(data.error || 'Failed to update profile');
      }

      this.setCurrentUser(data.user);
      return data.user;
    } catch (error) {
      throw new Error(error.message || 'Failed to update profile');
    }
  }

  // Change password
  async changePassword(passwordData) {
    try {
      const token = this.getToken();
      if (!token) throw new Error('No auth token found');

      const response = await fetch(`${this.baseUrl}/change-password`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(passwordData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          this.removeToken();
        }
        throw new Error(data.error || 'Failed to change password');
      }

      return data;
    } catch (error) {
      throw new Error(error.message || 'Failed to change password');
    }
  }

  // Make authenticated API request
  async authenticatedRequest(url, options = {}) {
    const token = this.getToken();
    if (!token) throw new Error('No auth token found');

    const config = {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    const response = await fetch(url, config);

    if (response.status === 401) {
      this.removeToken();
      throw new Error('Session expired. Please login again.');
    }

    return response;
  }
}

const authService = new AuthService();
export default authService;