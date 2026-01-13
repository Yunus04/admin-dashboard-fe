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

