import { api } from './client';
import type {
  User,
  PaginationParams,
  StoreUserPayload,
  UpdateUserPayload,
} from '@/types/models';

// Users API endpoints
export const usersApi = {
  // Get all users (Super Admin only)
  getUsers: (params?: PaginationParams & { include_deleted?: boolean }) =>
    api.get<User[]>('/users', params),

  // Get merchant users for merchant owner selection (Admin & Super Admin)
  getMerchantUsers: () =>
    api.get<User[]>('/merchant-owners'),

  // Create new user (Super Admin only)
  createUser: (data: StoreUserPayload) =>
    api.post<{ user: User }>('/users', data),

  // Get user by ID
  getUser: (id: string) =>
    api.get<{ user: User }>(`/users/${id}`),

  // Update user (Super Admin only)
  updateUser: (id: string, data: UpdateUserPayload) =>
    api.put<{ user: User }>(`/users/${id}`, data),

  // Delete user (Super Admin only)
  deleteUser: (id: string) =>
    api.delete<null>(`/users/${id}`),

  // Restore deleted user (Super Admin only)
  restoreUser: (id: string) =>
    api.post<{ user: User }>(`/users/${id}/restore`),
};

