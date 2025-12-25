import { authService } from './auth.service';
import { API_URL } from '../config/api.config';
import type { PaginatedResponse, User } from './admin.service';

type ManagerProfile = {
  user: {
    userId: string | null;
    email: string | null;
    name: string | null;
  };
  roles: string[];
};

class ManagerService {
  private baseUrl = `${API_URL}/manager`;

  private normalizeRoles(raw: any): string[] {
    const list = raw?.roles ?? raw?.Roles ?? [];

    return (Array.isArray(list) ? list : [])
      .map((x: any) => {
        if (typeof x === 'string') return x;
        if (x && typeof x === 'object') return x.name ?? x.roleName ?? x.role ?? '';
        return '';
      })
      .filter((x: any) => typeof x === 'string' && x.trim().length > 0);
  }

  private unwrapList(raw: any, keys: string[]): any[] {
    if (Array.isArray(raw)) return raw;

    const container = raw?.data ?? raw?.Data ?? raw?.items ?? raw?.Items ?? raw;
    if (Array.isArray(container)) return container;

    for (const key of keys) {
      const direct = raw?.[key];
      if (Array.isArray(direct)) return direct;

      const nested = container?.[key];
      if (Array.isArray(nested)) return nested;
    }

    return [];
  }

  async getDashboard(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/dashboard`, {
      method: 'GET',
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    return await response.json();
  }

  async getTeam(
    page: number = 1,
    pageSize: number = 20,
    searchTerm?: string,
    roleFilter?: string
  ): Promise<PaginatedResponse<User>> {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (searchTerm) params.append('searchTerm', searchTerm);
    if (roleFilter) params.append('roleFilter', roleFilter);

    const response = await fetch(`${this.baseUrl}/team?${params.toString()}`, {
      method: 'GET',
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

    const raw = await response.json();
    const users = raw?.users ?? raw?.Users ?? raw?.data ?? raw?.Data ?? [];
    const pagination =
      raw?.pagination ??
      raw?.Pagination ??
      { currentPage: page, pageSize, totalCount: 0, totalPages: 0 };

    const normalized: PaginatedResponse<User> = {
      data: Array.isArray(users) ? users : [],
      pagination,
    };

    return normalized;
  }

  async getProfile(): Promise<ManagerProfile> {
    const response = await fetch(`${this.baseUrl}/profile`, {
      method: 'GET',
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

    const raw = await response.json();
    const userRaw = raw?.user ?? raw?.User ?? raw?.profile?.user ?? raw?.Profile?.User ?? raw;
    const roles = this.normalizeRoles(raw);

    return {
      user: {
        userId: userRaw?.userId ?? userRaw?.userID ?? userRaw?.UserId ?? userRaw?.UserID ?? null,
        email: userRaw?.email ?? userRaw?.Email ?? null,
        name: userRaw?.name ?? userRaw?.personName ?? userRaw?.PersonName ?? userRaw?.fullName ?? null,
      },
      roles,
    };
  }

  async getReports(): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/reports`, {
      method: 'GET',
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

    const raw = await response.json();
    return this.unwrapList(raw, ['reports', 'Reports']);
  }

  async getTasks(): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/tasks`, {
      method: 'GET',
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

    const raw = await response.json();
    return this.unwrapList(raw, ['tasks', 'Tasks']);
  }

  async getInventory(): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/inventory`, {
      method: 'GET',
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

    const raw = await response.json();
    return this.unwrapList(raw, ['inventory', 'Inventory']);
  }

  async getSchedule(): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/schedule`, {
      method: 'GET',
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

    const raw = await response.json();
    return this.unwrapList(raw, ['schedule', 'Schedule']);
  }

  private async getAuthHeaders(): Promise<{ [key: string]: string }> {
    const token = await authService.getToken();
    return {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }
}

export const managerService = new ManagerService();
