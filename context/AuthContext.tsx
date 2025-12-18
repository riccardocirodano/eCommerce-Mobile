import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { AuthenticationResponse, LoginRequest, RegisterRequest } from '../types/auth.types';
import { authService } from '../services/auth.service';

interface AuthContextType {
  user: AuthenticationResponse | null;
  isLoading: boolean;
  login: (request: LoginRequest) => Promise<void>;
  register: (request: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthenticationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load user from storage on app start
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Failed to load user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (request: LoginRequest) => {
    const response = await authService.login(request);
    if (response.success) {
      setUser(response);
    } else {
      throw new Error('Login failed');
    }
  };

  const register = async (request: RegisterRequest) => {
    const response = await authService.register(request);
    if (response.success) {
      setUser(response);
    } else {
      throw new Error('Registration failed');
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};