import axios from 'axios';
import { LoginRequest, RegisterRequest, AuthenticationResponse } from '../types/auth.types';
import { ENDPOINTS } from '../config/api.config';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

// Create axios instance with interceptor for auth token
const apiClient = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Add auth token to all requests
apiClient.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token from storage:', error);
    }
    return config;
  },
  (error: any) => Promise.reject(error)
);

export const authService = {
  async login(request: LoginRequest): Promise<AuthenticationResponse> {
    try {
      console.log('Login attempt:', request);
      console.log('API URL:', ENDPOINTS.LOGIN);
      
      const response = await apiClient.post<AuthenticationResponse>(
        ENDPOINTS.LOGIN,
        request
      );
      
      console.log('Login response:', response.data);
      
      if (response.data.success) {
        localStorage.setItem(TOKEN_KEY, response.data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(response.data));
      }
      
      return response.data;
    } catch (error) {
      console.error('Login service error:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        console.error('Error details:', (error as any).response?.data);
      }
      throw error;
    }
  },

  async register(request: RegisterRequest): Promise<AuthenticationResponse> {
    try {
      const response = await apiClient.post<AuthenticationResponse>(
        ENDPOINTS.REGISTER,
        request
      );
      
      if (response.data.success) {
        localStorage.setItem(TOKEN_KEY, response.data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(response.data));
      }
      
      return response.data;
    } catch (error) {
      console.error('Register service error:', error);
      throw error;
    }
  },

  async logout(): Promise<void> {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch (error) {
      console.error('Logout service error:', error);
      throw error;
    }
  },

  async getCurrentUser(): Promise<AuthenticationResponse | null> {
    try {
      const userData = localStorage.getItem(USER_KEY);
      if (userData) {
        return JSON.parse(userData) as AuthenticationResponse;
      }
      return null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  },

  async getToken(): Promise<string | null> {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error('Get token error:', error);
      return null;
    }
  },
};