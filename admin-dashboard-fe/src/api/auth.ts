import apiClient from './client';
import type { AxiosError } from 'axios';
import type {
  User,
  LoginPayload,
  RegisterPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  ApiResponse,
} from '@/types/models';

// Auth API endpoints
export const authApi = {
  login: async (data: LoginPayload): Promise<ApiResponse<{ user: User }>> => {
    try {
      const response = await apiClient.post<ApiResponse<{ user: User }>>('/auth/login', data);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse<unknown>>;
      if (axiosError.response?.data) {
        throw axiosError;
      }
      throw error;
    }
  },

  // Register (Super Admin only)
  register: async (data: RegisterPayload): Promise<ApiResponse<{ user: User }>> => {
    const response = await apiClient.post<ApiResponse<{ user: User }>>('/auth/register', data);
    return response.data;
  },

  // Refresh token
  refreshToken: async (refreshToken: string): Promise<ApiResponse<{ user: User }>> => {
    const response = await apiClient.post<ApiResponse<{ user: User }>>('/auth/refresh', {
      refresh_token: refreshToken,
    });
    return response.data;
  },

  // Logout
  logout: async (): Promise<void> => {
    const refreshToken = localStorage.getItem('refresh_token');
    try {
      await apiClient.post('/auth/logout', { refresh_token: refreshToken });
    } catch {
      // Continue with logout even if request fails
    }
  },

  // Forgot Password
  forgotPassword: async (data: ForgotPasswordPayload): Promise<ApiResponse<{ reset_token: string; note: string }>> => {
    const response = await apiClient.post<ApiResponse<{ reset_token: string; note: string }>>('/auth/forgot-password', data);
    return response.data;
  },

  resetPassword: async (data: ResetPasswordPayload): Promise<ApiResponse<null>> => {
    try {
      const response = await apiClient.post<ApiResponse<null>>('/auth/reset-password', data);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse<unknown>>;
      if (axiosError.response?.data) {
        throw axiosError;
      }
      throw error;
    }
  },

  // Get current user (from stored data)
  getStoredUser: (): User | null => {
    const userData = localStorage.getItem('user_data');
    if (!userData || userData === 'undefined' || userData === 'null') {
      return null;
    }
    try {
      return JSON.parse(userData);
    } catch {
      return null;
    }
  },

  // Store user data
  storeUser: (user: User): void => {
    localStorage.setItem('user_data', JSON.stringify(user));
  },

  // Clear user data
  clearUser: (): void => {
    localStorage.removeItem('user_data');
    localStorage.removeItem('refresh_token');
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('auth_token');
  },

  // Get stored token
  getToken: (): string | null => {
    return localStorage.getItem('auth_token');
  },

  // Get refresh token
  getRefreshToken: (): string | null => {
    return localStorage.getItem('refresh_token');
  },

  // Store refresh token
  storeRefreshToken: (token: string): void => {
    localStorage.setItem('refresh_token', token);
  },
};

