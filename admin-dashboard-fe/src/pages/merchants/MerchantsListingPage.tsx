import { useEffect, useState } from 'react';
import { Card, Button, Badge, Input, SearchableSelect, Select } from '@/components/ui';
import { merchantsApi } from '@/api/merchants';
import { usersApi } from '@/api/users';
import { formatDate } from '@/utils/helpers';
import type { MerchantWithUser, User } from '@/types/models';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiShoppingBag, FiMapPin, FiMail, FiUser } from 'react-icons/fi';
import { useForm } from 'react-hook-form';

interface MerchantFilters {
  search: string;
  per_page: number;
  sort_by: string;
  sort_order: 'asc' | 'desc';
}

export function MerchantsListingPage() {
  const [merchants, setMerchants] = useState<MerchantWithUser[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [meta, setMeta] = useState<{
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingMerchant, setEditingMerchant] = useState<MerchantWithUser | null>(null);
  const [deletingMerchant, setDeletingMerchant] = useState<MerchantWithUser | null>(null);

  const { register, reset, watch } = useForm<MerchantFilters>({
    defaultValues: {
      search: '',
      per_page: 10,
      sort_by: 'created_at',
      sort_order: 'desc',
    },
  });

  const filters = watch();

  const fetchMerchants = async (page = 1) => {
    setIsLoading(true);
    try {
      const response = await merchantsApi.getMerchants({
        ...filters,
        page,
      });
      setMerchants(response.data || []);
      if (response.meta) {
        setMeta(response.meta);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load merchants');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    setIsUsersLoading(true);
    try {
      // Use the new endpoint that both Admin and Super Admin can access
      const response = await usersApi.getMerchantUsers();
      setUsers(response.data || []);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setIsUsersLoading(false);
    }
  };

  useEffect(() => {
    fetchMerchants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.per_page, filters.sort_by, filters.sort_order]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMerchants(1);
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search]);

  const handleSearch = () => {
    fetchMerchants(1);
  };

  const handleCreate = () => {
    setEditingMerchant(null);
    fetchUsers();
    setShowModal(true);
  };

  const handleEdit = (merchant: MerchantWithUser) => {
    setEditingMerchant(merchant);
    setShowModal(true);
  };

  const handleDelete = (merchant: MerchantWithUser) => {
    setDeletingMerchant(merchant);
  };

  const confirmDelete = async () => {
    if (!deletingMerchant) return;
    try {
      await merchantsApi.deleteMerchant(deletingMerchant.id.toString());
      setSuccess('Merchant deleted successfully');
      setError(null);
      setDeletingMerchant(null);
      fetchMerchants();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete merchant');
      setSuccess(null);
    }
  };

  const onSubmit = async (data: Record<string, unknown>) => {
    try {
      if (editingMerchant) {
        await merchantsApi.updateMerchant(editingMerchant.id.toString(), data);
        setSuccess('Merchant updated successfully');
      } else {
        await merchantsApi.createMerchant(data as {
          user_id: number;
          business_name: string;
          phone?: string;
          address?: string;
        });
        setSuccess('Merchant created successfully');
      }
      setShowModal(false);
      setError(null);
      reset();
      fetchMerchants();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save merchant');
      setSuccess(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Merchants Management</h1>
          <p className="text-slate-500 mt-1">Manage merchant profiles</p>
        </div>
        <Button onClick={handleCreate} className="btn-transition">
          <FiPlus className="w-4 h-4 mr-2" />
          Add Merchant
        </Button>
      </div>

      <Card className="card-hover">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 min-w-0">
            <Input
              placeholder="Search by business name or address..."
              leftIcon={<FiSearch className="w-4 h-4" />}
              {...register('search')}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="input-focus"
            />
          </div>
          <div className="grid grid-cols-2 sm:flex sm:flex-row gap-3 w-full sm:w-auto">
            <div className="min-w-0">
              <Select
                options={[
                  { value: '10', label: '10/page' },
                  { value: '25', label: '25/page' },
                  { value: '50', label: '50/page' },
                ]}
                {...register('per_page', { onChange: () => fetchMerchants(1) })}
              />
            </div>
            <div className="min-w-0">
              <Select
                options={[
                  { value: 'asc', label: 'Oldest' },
                  { value: 'desc', label: 'Newest' },
                ]}
                {...register('sort_order', { onChange: () => fetchMerchants(1) })}
              />
            </div>
          </div>
        </div>
      </Card>

      {success && (
        <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl p-4">
          <p className="text-green-700 dark:text-green-300">{success}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      <Card padding="none" className="overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="flex flex-col items-center space-y-3">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Loading merchants...</p>
            </div>
          </div>
        ) : merchants.length === 0 ? (
          <div className="py-16">
            <div className="empty-state">
              <div className="empty-state-icon">
                <FiShoppingBag className="w-8 h-8 text-slate-400 dark:text-slate-500" />
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-medium">No merchants found</p>
              <p className="text-slate-400 dark:text-slate-500 text-sm">Try adjusting your search or filters</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 sm:p-6">
            {merchants.map((merchant) => (
              <div
                key={merchant.id}
                className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 sm:p-5 hover:shadow-lg hover:border-indigo-200 dark:hover:border-indigo-700 transition-all duration-300 card-hover"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center min-w-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-linear-to-br from-green-100 to-green-200 dark:from-green-900/50 dark:to-green-800/50 rounded-xl flex items-center justify-center shrink-0">
                      <FiShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="ml-2 sm:ml-3 min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-white truncate">{merchant.business_name}</p>
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">{merchant.phone || 'No phone'}</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900/60 dark:text-green-300 shrink-0 ml-2">
                    Active
                  </Badge>
                </div>

                <div className="space-y-1.5 text-xs sm:text-sm">
                  <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300">
                    <FiUser className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 dark:text-slate-500 shrink-0" />
                    <span className="text-slate-500 dark:text-slate-400 shrink-0">Owner:</span>
                    <span className="font-medium text-slate-700 dark:text-slate-200 truncate">{merchant.user?.name || 'N/A'}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300">
                    <FiMail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 dark:text-slate-500 shrink-0" />
                    <span className="text-slate-500 dark:text-slate-400 shrink-0">Email:</span>
                    <span className="font-medium text-slate-700 dark:text-slate-200 truncate">{merchant.user?.email || 'N/A'}</span>
                  </div>
                  <div className="flex items-start space-x-2 text-slate-600 dark:text-slate-300">
                    <FiMapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 dark:text-slate-500 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <span className="text-slate-500 dark:text-slate-400 shrink-0">Address:</span>
                      <span className="font-medium text-slate-700 dark:text-slate-200 ml-1 truncate block">{merchant.address || 'Not provided'}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-700">
                    <FiShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 dark:text-slate-500 shrink-0" />
                    <span className="text-slate-500 dark:text-slate-400 shrink-0">Created:</span>
                    <span className="font-medium text-slate-700 dark:text-slate-200">{formatDate(merchant.created_at)}</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 flex justify-end space-x-1 sm:space-x-2">
                  <button
                    onClick={() => handleEdit(merchant)}
                    className="p-1.5 sm:p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <FiEdit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(merchant)}
                    className="p-1.5 sm:p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {meta && meta.last_page > 1 && (
          <div className="px-4 py-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs sm:text-sm text-slate-500">
              <span className="font-medium">{(meta.current_page - 1) * meta.per_page + 1}</span>-{' '}
              <span className="font-medium">{Math.min(meta.current_page * meta.per_page, meta.total)}</span> of{' '}
              <span className="font-medium">{meta.total}</span>
            </p>
            <div className="flex w-full sm:w-auto gap-2">
              <Button
                variant="secondary"
                size="sm"
                className="flex-1 sm:flex-none"
                disabled={meta.current_page === 1}
                onClick={() => fetchMerchants(meta.current_page - 1)}
              >
                Prev
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="flex-1 sm:flex-none"
                disabled={meta.current_page === meta.last_page}
                onClick={() => fetchMerchants(meta.current_page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {showModal && (
        <MerchantModal
          merchant={editingMerchant}
          users={users}
          isUsersLoading={isUsersLoading}
          onClose={() => {
            setShowModal(false);
            setEditingMerchant(null);
            reset();
          }}
          onSubmit={onSubmit}
        />
      )}

      {deletingMerchant && (
        <div className="fixed inset-0 bg-slate-900/50 dark:bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full mx-4 animate-slide-up">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-xl">
                <FiTrash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Delete Merchant</h3>
            </div>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              Are you sure you want to delete <span className="font-medium text-slate-900 dark:text-white">{deletingMerchant.business_name}</span>?
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <Button variant="secondary" onClick={() => setDeletingMerchant(null)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={confirmDelete}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface MerchantModalProps {
  merchant: MerchantWithUser | null;
  users: User[];
  isUsersLoading: boolean;
  onClose: () => void;
  onSubmit: (data: Record<string, unknown>) => void;
}

function MerchantModal({ merchant, users, isUsersLoading, onClose, onSubmit }: MerchantModalProps) {
  const [selectedUserId, setSelectedUserId] = useState<string>(
    merchant?.user_id ? merchant.user_id.toString() : ''
  );

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<{
    user_id: number;
    business_name: string;
    phone?: string;
    address?: string;
  }>({
    defaultValues: merchant
      ? {
          user_id: merchant.user_id,
          business_name: merchant.business_name,
          phone: merchant.phone || '',
          address: merchant.address || '',
        }
      : {},
  });

  const userOptions = [
    { value: '', label: 'Select Owner' },
    ...users.map(user => ({
      value: user.id.toString(),
      label: `${user.name} (${user.email})`,
    })),
  ];

  const handleUserChange = (value: string) => {
    setSelectedUserId(value);
    setValue('user_id', value ? parseInt(value) : 0);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 dark:bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            {merchant ? 'Edit Merchant' : 'Create Merchant'}
          </h3>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {!merchant ? (
            <SearchableSelect
              label="Owner"
              options={userOptions}
              value={selectedUserId}
              onChange={handleUserChange}
              error={!selectedUserId ? 'Owner is required' : undefined}
              disabled={isUsersLoading}
              required
              searchPlaceholder="Search by name or email..."
              noOptionsMessage="No users found"
            />
          ) : (
            <Input
              label="Owner"
              value={`${merchant.user?.name || 'N/A'} (${merchant.user?.email || 'N/A'})`}
              disabled
              className="input-focus bg-slate-50 dark:bg-slate-700"
            />
          )}

          <Input
            label="Business Name"
            error={errors.business_name?.message}
            {...register('business_name', { required: 'Business name is required' })}
            className="input-focus"
          />
          <Input
            label="Phone"
            type="tel"
            inputMode="numeric"
            placeholder="e.g., 081234567890"
            error={errors.phone?.message}
            {...register('phone', {
              pattern: {
                value: /^[0-9+\-\s]*$/,
                message: 'Phone number can only contain numbers, +, -, and spaces',
              },
            })}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (
                !/[0-9+\-\s]/.test(e.key) &&
                !['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)
              ) {
                e.preventDefault();
              }
            }}
            className="input-focus"
          />
          <Input
            label="Address"
            error={errors.address?.message}
            {...register('address')}
            className="input-focus"
          />
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{merchant ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

