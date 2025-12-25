import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoginRequest, RegisterRequest, AuthenticationResponse } from '../types/auth.types';
import { ENDPOINTS } from '../config/api.config';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

// Create axios instance with interceptor for auth token
const apiClient = axios.create({
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 15000,
  validateStatus: (status) => status < 500, // Accept all responses except server errors
});

// Add auth token to all requests
(apiClient.interceptors.request as any).use(
  async (config: any) => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);

      if (token) {
        config.headers = config.headers || {};
        const headersAny: any = config.headers;

        if (typeof headersAny.set === 'function') {
          headersAny.set('Authorization', `Bearer ${token}`);
        } else {
          headersAny['Authorization'] = `Bearer ${token}`;
        }
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
      
      // Ensure request body is properly serialized
      const requestData = JSON.stringify(request);
      console.log('Request data:', requestData);
      
      const response = await apiClient.post<AuthenticationResponse>(
        ENDPOINTS.LOGIN,
        requestData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': requestData.length.toString(),
          }
        }
      );
      
      console.log('Login response status:', response.status);
      console.log('Login response:', response.data);
      
      if (response.data.success) {
        await AsyncStorage.setItem(TOKEN_KEY, response.data.token);
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(response.data));
      }
      
      return response.data;
    } catch (error) {
      console.error('Login service error:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        console.error('Error status:', (error as any).response?.status);
        console.error('Error details:', (error as any).response?.data);
      }
      if (error && typeof error === 'object' && 'message' in error) {
        console.error('Error message:', (error as any).message);
      }
      throw error;
    }
  },

  async register(request: RegisterRequest): Promise<AuthenticationResponse> {
    try {
      console.log('Register attempt:', request);
      console.log('API URL:', ENDPOINTS.REGISTER);
      
      // Ensure request body is properly serialized
      const requestData = JSON.stringify(request);
      console.log('Request data:', requestData);
      
      const response = await apiClient.post<AuthenticationResponse>(
        ENDPOINTS.REGISTER,
        requestData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': requestData.length.toString(),
          }
        }
      );
      
      console.log('Register response status:', response.status);
      console.log('Register response:', response.data);
      
      if (response.data.success) {
        await AsyncStorage.setItem(TOKEN_KEY, response.data.token);
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(response.data));
      }
      
      return response.data;
    } catch (error) {
      console.error('Register service error:', error);
      throw error;
    }
  },

  async logout(): Promise<void> {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
      await AsyncStorage.removeItem(USER_KEY);
    } catch (error) {
      console.error('Logout service error:', error);
      throw error;
    }
  },

  async getCurrentUser(): Promise<AuthenticationResponse | null> {
    try {
      const userData = await AsyncStorage.getItem(USER_KEY);
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
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error('Get token error:', error);
      return null;
    }
  },
};