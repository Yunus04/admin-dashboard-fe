import { api } from './client';
import type {
  MerchantWithUser,
  PaginationParams,
  StoreMerchantPayload,
  UpdateMerchantPayload,
} from '@/types/models';

// Merchants API endpoints
export const merchantsApi = {
  // Get all merchants (Super Admin/Admin: all, Merchant: own)
  getMerchants: (params?: PaginationParams) =>
    api.get<MerchantWithUser[]>('/merchants', params),

  // Create new merchant (Super Admin/Admin only)
  createMerchant: (data: StoreMerchantPayload) =>
    api.post<{ merchant: MerchantWithUser }>('/merchants', data),

  // Get merchant by ID
  getMerchant: (id: string) =>
    api.get<{ merchant: MerchantWithUser }>(`/merchants/${id}`),

  // Update merchant (Merchant: own, Super Admin/Admin: any)
  updateMerchant: (id: string, data: UpdateMerchantPayload) =>
    api.put<{ merchant: MerchantWithUser }>(`/merchants/${id}`, data),

  // Delete merchant (Super Admin/Admin only)
  deleteMerchant: (id: string) =>
    api.delete<null>(`/merchants/${id}`),
};

