import { authService } from './auth.service';
import { API_URL } from '../config/api.config';

export interface User {
  userID: string;
  email: string;
  personName: string;
  gender: string;
  isActive: boolean;
  roles?: string[];
  createdDate?: string;
  createdAt?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}

export interface DashboardStats {
  totalUsers: number;
  usersByRole: { [key: string]: number };
  recentUsers: User[];
  systemInfo: {
    serverTime: string;
    version: string;
  };
}

export interface ActivityLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  timestamp: string;
  details: string;
}

export interface SystemSettings {
  applicationName: string;
  version: string;
  environment: string;
  maxUsersPerRole: { [key: string]: number };
  securitySettings: {
    passwordMinLength: number;
    requireEmailConfirmation: boolean;
    sessionTimeoutMinutes: number;
  };
}

export interface Role {
  roleID: string;
  name: string;
}

class AdminService {
  private baseUrl = `${API_URL}/admin`;

  async getDashboardStats(): Promise<{ stats: DashboardStats }> {
    try {
      const response = await fetch(`${this.baseUrl}/dashboard`, {
        method: 'GET',
        headers: await this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }

  async getUsers(page = 1, pageSize = 20, searchTerm?: string, roleFilter?: string): Promise<PaginatedResponse<User>> {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (searchTerm) params.append('searchTerm', searchTerm);
    if (roleFilter) params.append('roleFilter', roleFilter);

    const response = await fetch(`${this.baseUrl}/users?${params.toString()}`, {
      method: 'GET',
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

    const raw = await response.json();

    const users = raw.users ?? raw.Users ?? [];
    const pagination = raw.pagination ?? raw.Pagination ?? { currentPage: page, pageSize, totalCount: 0, totalPages: 0 };

    return { data: users, pagination };
  }

  async getUserById(userId: string): Promise<{ user: User }> {
    const response = await fetch(`${this.baseUrl}/users/${userId}`, {
      method: 'GET',
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

    const raw = await response.json();
    const user = raw.user ?? raw.User;

    const roleNames = (raw.roles ?? raw.Roles ?? [])
      .map((x: any) => {
        if (typeof x === 'string') return x;
        if (x && typeof x === 'object') return x.name ?? x.roleName ?? '';
        return '';
      })
      .filter((x: any) => typeof x === 'string' && x.trim().length > 0);

    return { user: { ...user, roles: roleNames } };
  }

  async updateUserRole(userId: string, roleName: string): Promise<{ message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/users/${userId}/roles`, {
        method: 'POST',
        headers: await this.getAuthHeaders(),
        body: JSON.stringify({ roleName }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  }

  async toggleUserStatus(userId: string): Promise<{ message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/users/${userId}/toggle-status`, {
        method: 'POST',
        headers: await this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error toggling user status:', error);
      throw error;
    }
  }

  async getAllRoles(): Promise<{ roles: Role[] }> {
    const response = await fetch(`${this.baseUrl}/roles`, {
      method: 'GET',
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

    const raw = await response.json();
    const list = raw.roles ?? raw.Roles ?? [];

    return {
      roles: list.map((x: any) => ({
        roleID: x.roleID ?? x.roleId,
        name: x.name ?? x.roleName,
      })),
    };
  }

  async getActivityLogs(page: number = 1, pageSize: number = 50): Promise<PaginatedResponse<ActivityLog>> {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });

    const response = await fetch(`${this.baseUrl}/activity-logs?${params.toString()}`, {
      method: 'GET',
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

    const raw = await response.json();

    // Support: { data, pagination }, { logs, pagination }, { activityLogs, pagination }
    // Also support wrappers: { activityLogs: { ... } } or { ActivityLogs: { ... } }
    const container =
      raw?.activityLogs ??
      raw?.ActivityLogs ??
      raw?.logs ??
      raw?.Logs ??
      raw;

    const data =
      container?.data ??
      container?.Data ??
      container?.activityLogs ??
      container?.ActivityLogs ??
      container?.logs ??
      container?.Logs ??
      container?.items ??
      container?.Items ??
      [];

    const pagination =
      container?.pagination ??
      container?.Pagination ??
      raw?.pagination ??
      raw?.Pagination ??
      { currentPage: page, pageSize, totalCount: 0, totalPages: 0 };

    return {
      data: Array.isArray(data) ? data : [],
      pagination,
    };
  }

  async getSystemSettings(): Promise<SystemSettings> {
    const response = await fetch(`${this.baseUrl}/settings`, {
      method: 'GET',
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

    const raw = await response.json();

    // Support: { settings }, { Settings }, { data }, { Data }, or raw is already the settings object
    const settings =
      raw?.settings ??
      raw?.Settings ??
      raw?.data ??
      raw?.Data ??
      raw?.systemSettings ??
      raw?.SystemSettings ??
      raw;

    return settings as SystemSettings;
  }

  private async getAuthHeaders(): Promise<{ [key: string]: string }> {
    const token = await authService.getToken();
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }
}

export const adminService = new AdminService();