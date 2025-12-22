// Backend DTO Types matching your ASP.NET Core backend

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  personName: string;
  gender: Gender;
  roleName: string;
}

export interface AuthenticationResponse {
  userID: string;
  email: string;
  personName: string | null;
  gender: string | null;
  token: string;
  success: boolean;
  roles?: string[];
}

export enum Gender {
  Male = 0,
  Female = 1,
  Other = 2
}

export enum UserRole {
  Admin = 'Admin',
  User = 'User',
  Manager = 'Manager'
}

// Additional utility types
export interface AuthError {
  message: string;
  code?: string;
}

export interface AuthState {
  user: AuthenticationResponse | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}