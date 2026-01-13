import axios, { type AxiosInstance, type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { ApiResponse, ApiError } from '@/types/models';

// API Base URL - Change this to your backend URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError<ApiError>) => {
    // Log error details for debugging
    console.error('API Error:', error.config?.url, error.response?.data || error.message);

    // Check if we're on the login page or making login/forgot-password requests
    const isLoginRequest = error.config?.url?.includes('/auth/login');
    const isForgotPasswordRequest = error.config?.url?.includes('/auth/forgot-password');
    const isResetPasswordRequest = error.config?.url?.includes('/auth/reset-password');
    const isRegisterRequest = error.config?.url?.includes('/auth/register');

    // Skip auto-redirect for auth-related requests - let components handle the error
    const isAuthRequest = isLoginRequest || isForgotPasswordRequest || isResetPasswordRequest || isRegisterRequest;

    // Handle 401 Unauthorized - ONLY for non-auth requests
    if (error.response?.status === 401 && !isAuthRequest) {
      // Clear auth data
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');

      // Check if we're not already on the login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login?reason=unauthorized';
      }
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.error('Access forbidden:', error.response.data?.message);
    }

    // Handle validation errors (422)
    if (error.response?.status === 422) {
      console.error('Validation error:', error.response.data);
    }

    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message);
    }

    // IMPORTANT: Always reject the error so components can handle it
    return Promise.reject(error);
  }
);

export default apiClient;

// API Helper functions
export const api = {
  get: <T>(url: string, params?: object): Promise<ApiResponse<T>> =>
    apiClient.get<ApiResponse<T>>(url, { params }).then((res) => res.data),

  post: <T>(url: string, data?: object): Promise<ApiResponse<T>> =>
    apiClient.post<ApiResponse<T>>(url, data).then((res) => res.data),

  put: <T>(url: string, data?: object): Promise<ApiResponse<T>> =>
    apiClient.put<ApiResponse<T>>(url, data).then((res) => res.data),

  patch: <T>(url: string, data?: object): Promise<ApiResponse<T>> =>
    apiClient.patch<ApiResponse<T>>(url, data).then((res) => res.data),

  delete: <T>(url: string): Promise<ApiResponse<T>> =>
    apiClient.delete<ApiResponse<T>>(url).then((res) => res.data),
};

