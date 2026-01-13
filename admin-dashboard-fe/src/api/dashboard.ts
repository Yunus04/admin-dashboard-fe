import { api } from './client';
import type { DashboardData } from '@/types/models';

// Dashboard API endpoints
export const dashboardApi = {
  // Get dashboard data based on user role
  getDashboard: () =>
    api.get<DashboardData>('/dashboard'),
};

