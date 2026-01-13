/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import apiClient from '@/api/client';
import { authApi } from '@/api/auth';
import settingsApi from '@/api/settings';
import type { User } from '@/types/models';
import type { AxiosError } from 'axios';
import type { ResetPasswordPayload } from '@/types/models';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; role: 'admin' | 'merchant' }) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ reset_token: string; note: string } | null>;
  resetPassword: (data: ResetPasswordPayload) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Flag to prevent infinite refresh loops
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach(cb => cb(token));
  refreshSubscribers = [];
};

// Helper to extract user data from response
const extractUserData = (responseData: unknown): User => {
  // Handle response.data.user format
  if (responseData && typeof responseData === 'object' && 'user' in responseData) {
    return (responseData as { user: User }).user;
  }
  // Handle direct response format
  return responseData as User;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      const storedUser = authApi.getStoredUser();
      const isAuth = authApi.isAuthenticated();

      if (storedUser && isAuth) {
        setUser(storedUser);
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  // Setup axios interceptor for token refresh
  useEffect(() => {
    const interceptor = apiClient.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          const refreshToken = authApi.getRefreshToken();

          if (!refreshToken) {
            // No refresh token available, logout
            authApi.clearUser();
            setUser(null);
            return Promise.reject(error);
          }

          if (!isRefreshing) {
            isRefreshing = true;

            try {
              const response = await authApi.refreshToken(refreshToken);
              const userData = extractUserData(response.data);
              const newToken = userData.token;
              const newRefreshToken = (userData as { refresh_token?: string }).refresh_token;

              // Check if tokens exist
              if (!newToken) {
                throw new Error('No token in refresh response');
              }

              // Store new tokens
              localStorage.setItem('auth_token', newToken);
              if (newRefreshToken) {
                authApi.storeRefreshToken(newRefreshToken);
              }

              // Update stored user data
              authApi.storeUser(userData);
              setUser(userData);

              // Notify all subscribers
              onTokenRefreshed(newToken);

              return apiClient(originalRequest);
            } catch (refreshError) {
              // Refresh failed, logout
              isRefreshing = false;
              authApi.clearUser();
              setUser(null);
              return Promise.reject(refreshError);
            }
          } else {
            // Wait for token to be refreshed
            return new Promise((resolve) => {
              subscribeTokenRefresh((token) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                resolve(apiClient(originalRequest));
              });
            });
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      apiClient.interceptors.response.eject(interceptor);
    };
  }, []);

  // Login
  const login = useCallback(async (email: string, password: string): Promise<void> => {
    try {
      const response = await authApi.login({ email, password });

      const userData = extractUserData(response.data);

      if (!userData || !userData.token) {
        console.error('Invalid login response structure:', response);
        throw new Error('Invalid login response');
      }

      // Store auth data - ensure this is BEFORE setUser
      localStorage.setItem('auth_token', userData.token);
      const refreshToken = (userData as { refresh_token?: string }).refresh_token;
      if (refreshToken) {
        authApi.storeRefreshToken(refreshToken);
      }
      authApi.storeUser(userData);

      // Set user state - this will trigger isAuthenticated to become true
      setUser(userData);
    } catch (error) {
      console.error('Login error:', error);

      // Extract error message from Axios error
      const axiosError = error as AxiosError<{ message?: string; success?: boolean }>;

      let errorMessage = 'Login failed. Please try again.';

      if (axiosError.response?.data) {
        const responseData = axiosError.response.data;

        // Handle {success: false, message: '...'} format from backend
        if (typeof responseData === 'object' && responseData.message) {
          errorMessage = responseData.message;
        }
        // Handle string response
        else if (typeof responseData === 'string') {
          errorMessage = responseData;
        }
      } else if (axiosError.message) {
        errorMessage = axiosError.message;
      }

      // Create custom error with extracted message
      const customError = new Error(errorMessage) as AxiosError<{ message?: string }>;
      customError.response = axiosError.response;

      throw customError;
    }
  }, []);

  // Register (Super Admin only)
  const register = useCallback(async (data: { name: string; email: string; password: string; role: 'admin' | 'merchant' }) => {
    setIsLoading(true);
    try {
      const response = await authApi.register(data);
      const userData = extractUserData(response.data);

      if (!userData || !userData.token) {
        throw new Error('Invalid register response');
      }

      // Store auth data
      localStorage.setItem('auth_token', userData.token);
      const refreshToken = (userData as { refresh_token?: string }).refresh_token;
      if (refreshToken) {
        authApi.storeRefreshToken(refreshToken);
      }
      authApi.storeUser(userData);

      setUser(userData);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear auth data regardless of API response
      localStorage.removeItem('auth_token');
      authApi.clearUser();
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  // Forgot Password
  const forgotPassword = useCallback(async (email: string): Promise<{ reset_token: string; note: string } | null> => {
    const response = await authApi.forgotPassword({ email });
    // Handle case where response is null or doesn't contain reset_token
    if (!response || !response.data) {
      return null;
    }
    return response.data;
  }, []);

  // Reset Password
  const resetPassword = useCallback(async (data: ResetPasswordPayload) => {
    await authApi.resetPassword(data);
  }, []);

  // Refresh user data
  const refreshUser = useCallback(async () => {
    try {
      const response = await settingsApi.profile.get();
      const userData = response.data.data; // API returns {success, message, data}
      authApi.storeUser(userData);
      setUser(userData);
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

