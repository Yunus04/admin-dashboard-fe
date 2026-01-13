import { useEffect, useState } from 'react';
import { Card, CardHeader, Badge } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { usePermission } from '@/hooks/usePermission';
import { dashboardApi } from '@/api/dashboard';
import { formatDate, getRoleDisplayName } from '@/utils/helpers';
import type { DashboardData } from '@/types/models';
import {
  FiUsers,
  FiShoppingBag,
  FiUserCheck,
  FiUserX,
  FiTrendingUp,
  FiActivity,
  FiUser,
  FiMapPin,
  FiPhone,
  FiCalendar,
} from 'react-icons/fi';

export function DashboardPage() {
  const { user } = useAuth();
  const { isSuperAdmin, isAdmin, isMerchant } = usePermission();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await dashboardApi.getDashboard();
        setData(response.data);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center space-y-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-lg">
            <FiActivity className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p className="text-red-800 dark:text-red-300 font-medium">Error loading dashboard</p>
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="page-header">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-slate-500 mt-1">
            Here&apos;s what&apos;s happening with your dashboard today.
          </p>
        </div>
        <Badge
          variant={
            user?.role === 'super_admin'
              ? 'default'
              : user?.role === 'admin'
              ? 'info'
              : 'success'
          }
          size="md"
          className="capitalize"
        >
          {getRoleDisplayName(user?.role || 'merchant')}
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {/* Super Admin Stats */}
        {isSuperAdmin() && data && (
          <>
            <StatCard
              title="Total Users"
              value={data.summary?.total_users || 0}
              icon={<FiUsers className="w-6 h-6" />}
              color="stat-gradient-blue"
              iconBg="bg-blue-100"
            />
            <StatCard
              title="Total Merchants"
              value={data.summary?.total_merchants || 0}
              icon={<FiShoppingBag className="w-6 h-6" />}
              color="stat-gradient-green"
              iconBg="bg-green-100"
            />
            <StatCard
              title="Active Merchants"
              value={data.summary?.active_merchants || 0}
              icon={<FiUserCheck className="w-6 h-6" />}
              color="stat-gradient-indigo"
              iconBg="bg-indigo-100"
            />
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 card-hover">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Users by Role</p>
                  <div className="mt-3 space-y-2">
                    {data.users_by_role &&
                      Object.entries(data.users_by_role).map(([role, count]) => (
                        <div key={role} className="flex justify-between text-sm">
                          <span className="text-slate-600 dark:text-slate-300 capitalize">
                            {role.replace('_', ' ')}
                          </span>
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {count}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
                <div className="p-2.5 bg-purple-100 dark:bg-purple-900/50 rounded-xl">
                  <FiActivity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Admin Stats */}
        {isAdmin() && data && (
          <>
            <StatCard
              title="Total Merchants"
              value={data.summary?.total_merchants || 0}
              icon={<FiShoppingBag className="w-6 h-6" />}
              color="stat-gradient-green"
              iconBg="bg-green-100"
            />
            <StatCard
              title="Active Merchants"
              value={data.summary?.active_merchants || 0}
              icon={<FiUserCheck className="w-6 h-6" />}
              color="stat-gradient-indigo"
              iconBg="bg-indigo-100"
            />
            <StatCard
              title="Inactive Merchants"
              value={data.summary?.inactive_merchants || 0}
              icon={<FiUserX className="w-6 h-6" />}
              color="stat-gradient-yellow"
              iconBg="bg-yellow-100"
            />
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 card-hover">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Activity Rate</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                    {data.summary?.total_merchants
                      ? Math.round(
                          ((data.summary.active_merchants || 0) /
                            (data.summary.total_merchants || 1)) *
                            100
                        )
                      : 0}
                    %
                  </p>
                </div>
                <div className="p-2.5 bg-green-100 dark:bg-green-900/50 rounded-xl">
                  <FiTrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Merchant Stats */}
        {isMerchant() && data?.merchant && (
          <>
            <div className="col-span-full lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 card-hover">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl">
                  <FiShoppingBag className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Business Information
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                  <FiMapPin className="w-5 h-5 text-slate-400 dark:text-slate-500 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Business Name</p>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {data.merchant.business_name}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                  <FiPhone className="w-5 h-5 text-slate-400 dark:text-slate-500 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Phone</p>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {data.merchant.phone || '-'}
                    </p>
                  </div>
                </div>
                <div className="sm:col-span-2 flex items-start space-x-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                  <FiMapPin className="w-5 h-5 text-slate-400 dark:text-slate-500 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Address</p>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {data.merchant.address || '-'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                  <FiCalendar className="w-5 h-5 text-slate-400 dark:text-slate-500 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Created At</p>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {formatDate(data.merchant.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-span-full lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 card-hover">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-xl">
                  <FiUser className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Account Information
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 dark:text-purple-400 font-medium">
                      {data.merchant.user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Name</p>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {data.merchant.user?.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                  <div className="w-10 h-10 bg-slate-200 dark:bg-slate-600 rounded-full flex items-center justify-center">
                    <FiUser className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Email</p>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {data.merchant.user?.email}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Recent Activity */}
      {isSuperAdmin() && data && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Users */}
          <Card className="card-hover">
            <CardHeader
              title="Recent Users"
              subtitle="Latest registered users"
            />
            <div className="space-y-3">
              {data.recent_users?.slice(0, 5).map((userItem) => (
                <div
                  key={userItem.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center">
                      <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                        {userItem.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {userItem.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{userItem.email}</p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      userItem.role === 'super_admin'
                        ? 'default'
                        : userItem.role === 'admin'
                        ? 'info'
                        : 'success'
                    }
                    size="sm"
                    className="capitalize"
                  >
                    {userItem.role.replace('_', ' ')}
                  </Badge>
                </div>
              ))}
              {(!data.recent_users || data.recent_users.length === 0) && (
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <FiUsers className="w-6 h-6 text-slate-400 dark:text-slate-500" />
                  </div>
                  <p className="text-slate-500 dark:text-slate-400">No recent users</p>
                </div>
              )}
            </div>
          </Card>

          {/* Recent Merchants */}
          <Card className="card-hover">
            <CardHeader
              title="Recent Merchants"
              subtitle="Latest registered merchants"
            />
            <div className="space-y-3">
              {data.recent_merchants?.slice(0, 5).map((merchant) => (
                <div
                  key={merchant.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                      <FiShoppingBag className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {merchant.business_name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {merchant.user?.name}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {formatDate(merchant.created_at)}
                  </span>
                </div>
              ))}
              {(!data.recent_merchants ||
                data.recent_merchants.length === 0) && (
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <FiShoppingBag className="w-6 h-6 text-slate-400 dark:text-slate-500" />
                  </div>
                  <p className="text-slate-500 dark:text-slate-400">No recent merchants</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Admin Recent Merchants */}
      {isAdmin() && data && (
        <Card className="card-hover">
          <CardHeader
            title="Recent Merchants"
            subtitle="Latest registered merchants"
          />
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Business
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Owner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {data.recent_merchants?.slice(0, 5).map((merchant) => (
                  <tr key={merchant.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="shrink-0 w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                          <FiShoppingBag className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                            {merchant.business_name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-slate-900 dark:text-white">
                        {merchant.user?.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {merchant.user?.email}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-slate-900 dark:text-white">
                        {merchant.phone || '-'}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                      {formatDate(merchant.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(!data.recent_merchants ||
              data.recent_merchants.length === 0) && (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <FiShoppingBag className="w-6 h-6 text-slate-400 dark:text-slate-500" />
                </div>
                <p className="text-slate-500 dark:text-slate-400">No recent merchants</p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}

// Stat Card Component
interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  iconBg: string;
}

function StatCard({ title, value, icon, color, iconBg }: StatCardProps) {
  return (
    <div className={`rounded-2xl shadow-sm border border-slate-100 p-6 card-hover bg-transparent ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-white/90">{title}</p>
          <p className="text-3xl font-bold text-white mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${iconBg}`}>{icon}</div>
      </div>
    </div>
  );
}

