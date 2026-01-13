import { useEffect, useCallback, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/AuthContext';
import { FiMail, FiLock, FiLogIn, FiAlertCircle, FiEye, FiEyeOff } from 'react-icons/fi';
import { loginSchema, type LoginFormData } from '@/validations';

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, isAuthenticated, user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Ref for tracking login state
  const loginSuccessRef = useRef(false);

  // Only show session expired message after user has tried to access a protected page
  // (indicated by having auth_token but still being on login page)
  const reason = searchParams.get('reason');
  const redirectReason = reason === 'unauthorized'
    ? 'Your session has expired. Please log in again.'
    : null;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Navigate to dashboard on successful login
  useEffect(() => {
    if (isAuthenticated && user && loginSuccessRef.current) {
      loginSuccessRef.current = false;
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const doLogin = useCallback(async (email: string, password: string) => {
    loginSuccessRef.current = false;

    try {
      await login(email, password);
      loginSuccessRef.current = true;
    } catch (err: unknown) {
      // Login failed - show error
      let errorMsg = 'Login failed. Please try again.';

      const error = err as {
        message?: string;
        response?: {
          data?: { success?: boolean; message?: string; error?: string };
          status?: number;
        };
      };

      if (error.response?.data) {
        const responseData = error.response.data;

        if (typeof responseData === 'object' && responseData.message) {
          errorMsg = responseData.message;
        } else if (typeof responseData === 'object' && responseData.error) {
          errorMsg = responseData.error;
        }
      } else if (error.message) {
        errorMsg = error.message;
      }

      if (error.response?.status === 401) {
        errorMsg = 'Invalid email or password';
      } else if (error.response?.status === 422) {
        errorMsg = 'Please check your input and try again';
      } else if (error.response?.status === 500) {
        errorMsg = 'Server error. Please try again later';
      }

      return { success: false, error: errorMsg };
    }
    return { success: true };
  }, [login]);

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    const result = await doLogin(data.email, data.password);
    if (result?.error) {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">

      <div className="max-w-md w-full" id="login-container">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-600 rounded-xl mb-4">
            <span className="text-white font-bold text-lg">AD</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">AdminPanel</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Sign in to your account</p>
        </div>

        {/* Form container */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg dark:shadow-xl dark:shadow-slate-900/50 border border-slate-200 dark:border-slate-700 p-8">

          {/* Redirect message - only show if explicitly redirected */}
          {redirectReason && (
            <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <p className="text-sm text-amber-800 dark:text-amber-200">{redirectReason}</p>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center">
              <FiAlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="admin@admin.com"
                  {...register('email')}
                  className={`block w-full pl-10 pr-3 py-2.5 bg-white dark:bg-slate-700 border rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    errors.email
                      ? 'border-red-500'
                      : 'border-slate-200 dark:border-slate-600'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  {...register('password')}
                  className={`block w-full pl-10 pr-10 py-2.5 bg-white dark:bg-slate-700 border rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    errors.password
                      ? 'border-red-500'
                      : 'border-slate-200 dark:border-slate-600'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  {showPassword ? (
                    <FiEyeOff className="h-4 w-4" />
                  ) : (
                    <FiEye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700"
                />
                <span className="ml-2 text-sm text-slate-600 dark:text-slate-400">Remember me</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-medium rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center">
                  <FiLogIn className="w-4 h-4 mr-2" />
                  Sign in
                </span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Demo credentials:{' '}
              <span className="font-mono text-xs bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-600">
                admin@admin.com / password
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface ApiError {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
}

// Auth Types
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'merchant';
  token?: string;
  refresh_token?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  merchant?: {
    id: number;
    business_name: string;
  } | null;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'merchant';
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  password: string;
  token: string;
  password_confirmation: string;
}

// Dashboard Types
export interface DashboardData {
  summary: {
    total_users?: number;
    total_merchants: number;
    active_merchants: number;
    inactive_merchants?: number;
  };
  users_by_role?: Record<string, number>;
  recent_users?: User[];
  recent_merchants?: MerchantWithUser[];
  merchant?: {
    id: number;
    business_name: string;
    phone: string;
    address: string;
    user: {
      id: number;
      name: string;
      email: string;
    };
    created_at: string;
  };
}

export interface SuperAdminDashboardData extends DashboardData {
  summary: {
    total_users: number;
    total_merchants: number;
    active_merchants: number;
  };
  users_by_role: Record<string, number>;
  recent_users: User[];
  recent_merchants: MerchantWithUser[];
}

export interface AdminDashboardData extends DashboardData {
  summary: {
    total_merchants: number;
    active_merchants: number;
    inactive_merchants: number;
  };
  recent_merchants: MerchantWithUser[];
}

// Merchant Types
export interface Merchant {
  id: number;
  user_id: number;
  business_name: string;
  phone: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

export interface MerchantWithUser extends Merchant {
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

export interface StoreMerchantPayload {
  user_id: number;
  business_name: string;
  phone?: string;
  address?: string;
}

export interface UpdateMerchantPayload {
  business_name?: string;
  phone?: string;
  address?: string;
}

// User Payload Types
export interface StoreUserPayload {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'merchant';
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  password?: string;
  role?: 'admin' | 'merchant';
}

// Pagination & Filter Types
export interface PaginationParams {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

// Role Types
export type UserRole = 'super_admin' | 'admin' | 'merchant';

export interface RolePermissions {
  canViewUsers: boolean;
  canCreateUsers: boolean;
  canUpdateUsers: boolean;
  canDeleteUsers: boolean;
  canViewMerchants: boolean;
  canCreateMerchants: boolean;
  canUpdateMerchants: boolean;
  canDeleteMerchants: boolean;
  canViewAllMerchants: boolean;
}

