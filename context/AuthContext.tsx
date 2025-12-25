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
  getUserRoles: () => string[];
  hasRole: (role: string) => boolean;
  isAdmin: () => boolean;
  isManager: () => boolean;
  isUser: () => boolean;
  getDashboardScreen: () => string;
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

  const getUserRoles = (): string[] => {
    if (!user?.token) return [];

    try {
      const tokenParts = user.token.split('.');
      if (tokenParts.length !== 3) return [];

      // base64url -> base64
      let base64 = tokenParts[1].replace(/-/g, '+').replace(/_/g, '/');
      while (base64.length % 4 !== 0) base64 += '=';

      const payload = JSON.parse(atob(base64));

      const candidates = [
        payload.role,
        payload.roles,
        payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'],
        payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role'],
      ];

      const roles = new Set<string>();
      for (const value of candidates) {
        if (Array.isArray(value)) {
          value.filter((r) => typeof r === 'string' && r.trim()).forEach((r) => roles.add(r));
        } else if (typeof value === 'string' && value.trim()) {
          roles.add(value);
        }
      }

      return Array.from(roles);
    } catch (error) {
      console.error('Error decoding token:', error);
      return [];
    }
  };

  const hasRole = (role: string): boolean => {
    return getUserRoles().includes(role);
  };

  const isAdmin = (): boolean => {
    return hasRole('Admin');
  };

  const isManager = (): boolean => {
    return hasRole('Manager');
  };

  const isUser = (): boolean => {
    return hasRole('User');
  };

  const getDashboardScreen = (): string => {
    if (isAdmin()) {
      return 'AdminDashboard';
    } else if (isManager()) {
      return 'ManagerDashboard';
    } else {
      return 'UserDashboard';
    }
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
        getUserRoles,
        hasRole,
        isAdmin,
        isManager,
        isUser,
        getDashboardScreen,
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