import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, Button, Badge, Input, Select } from '@/components/ui';
import { usersApi } from '@/api/users';
import { formatDate, getRoleDisplayName, getRoleBadgeColor } from '@/utils/helpers';
import type { User } from '@/types/models';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiRefreshCw, FiUsers, FiEye, FiEyeOff } from 'react-icons/fi';
import {
  userFiltersSchema,
  createUserSchema,
  updateUserSchema,
  type UserFiltersFormData
} from '@/validations';
import type { z } from 'zod';

// Type for form that combines create and update
type UserFormData = z.infer<typeof createUserSchema> & z.infer<typeof updateUserSchema>;

export function UsersListingPage() {
  const [searchParams] = useSearchParams();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [meta, setMeta] = useState<{
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [modalErrors, setModalErrors] = useState<Record<string, string>>({});
  const [showDeleted, setShowDeleted] = useState(false);

  // Get initial search value from URL params
  const urlSearch = searchParams.get('search') || '';

  const { register, reset, watch } = useForm<UserFiltersFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(userFiltersSchema) as any,
    defaultValues: {
      search: urlSearch,
      per_page: 10,
      sort_by: 'created_at',
      sort_order: 'desc',
    },
  });

  const filters = watch();

  const fetchUsers = async (page = 1) => {
    setIsLoading(true);
    try {
      const response = await usersApi.getUsers({
        search: filters.search,
        per_page: Number(filters.per_page),
        sort_by: filters.sort_by,
        sort_order: filters.sort_order,
        page,
        include_deleted: showDeleted,
      });
      setUsers(response.data || []);
      if (response.meta) {
        setMeta(response.meta);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.per_page, filters.sort_by, filters.sort_order, showDeleted]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(1);
    }, 300);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search]);

  const handleCreate = () => {
    setEditingUser(null);
    setModalErrors({});
    setShowModal(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setModalErrors({});
    setShowModal(true);
  };

  const handleDelete = (user: User) => {
    setDeletingUser(user);
  };

  const confirmDelete = async () => {
    if (!deletingUser) return;

    try {
      await usersApi.deleteUser(deletingUser.id.toString());
      setSuccess('User deleted successfully');
      setError(null);
      setDeletingUser(null);
      fetchUsers();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
      setSuccess(null);
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await usersApi.restoreUser(id);
      setSuccess('User restored successfully');
      setError(null);
      fetchUsers();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to restore user');
      setSuccess(null);
    }
  };

  const onSubmit = async (data: UserFormData) => {
    try {
      if (editingUser) {
        // Filter out undefined values and password_confirmation for update
        const updateData: Record<string, unknown> = {};
        if (data.name) updateData.name = data.name;
        if (data.email) updateData.email = data.email;
        if (data.role) updateData.role = data.role;
        if (data.password) {
          updateData.password = data.password;
          updateData.password_confirmation = data.password_confirmation;
        }
        
        await usersApi.updateUser(editingUser.id.toString(), updateData);
        setSuccess('User updated successfully');
      } else {
        await usersApi.createUser(data as { name: string; email: string; password: string; password_confirmation: string; role: 'admin' | 'merchant' });
        setSuccess('User created successfully');
      }
      setShowModal(false);
      setError(null);
      setModalErrors({});
      reset();
      fetchUsers();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      // Handle API validation errors (422) from axios
      const axiosError = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };
      const errorData = axiosError.response?.data;

      if (errorData?.errors) {
        // Map backend errors to form field format
        const fieldErrors: Record<string, string> = {};
        Object.entries(errorData.errors).forEach(([key, value]) => {
          fieldErrors[key] = Array.isArray(value) ? value[0] : value;
        });
        setModalErrors(fieldErrors);
        return; // Keep modal open
      }

      // Handle general error message
      if (errorData?.message) {
        setModalErrors({ _general: errorData.message });
        return;
      }

      setError(err instanceof Error ? err.message : 'Failed to save user');
      setSuccess(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Users Management</h1>
          <p className="text-slate-500 mt-1">Manage system users and their roles</p>
        </div>
        <Button onClick={handleCreate} className="btn-transition">
          <FiPlus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Filters */}
      <Card className="card-hover">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 min-w-0">
            <Input
              placeholder="Search by name or email..."
              leftIcon={<FiSearch className="w-4 h-4" />}
              {...register('search')}
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
                {...register('per_page', { 
                  onChange: () => fetchUsers(1),
                  setValueAs: (value: string) => Number(value)
                })}
              />
            </div>
            <div className="min-w-0">
              <Select
                options={[
                  { value: 'asc', label: 'Oldest' },
                  { value: 'desc', label: 'Newest' },
                ]}
                {...register('sort_order', { onChange: () => fetchUsers(1) })}
              />
            </div>
            <button
              onClick={() => {
                setShowDeleted(!showDeleted);
                fetchUsers(1);
              }}
              className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all ${showDeleted
                  ? 'bg-red-50 text-red-600 dark:bg-red-900/50 dark:text-red-300 border border-red-200 dark:border-red-800'
                  : 'bg-slate-50 text-slate-600 dark:bg-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600'
                }`}
            >
              {showDeleted ? (
                <>
                  <FiEyeOff className="w-4 h-4 mr-2" />
                  Hide Deleted
                </>
              ) : (
                <>
                  <FiEye className="w-4 h-4 mr-2" />
                  Show Deleted
                </>
              )}
            </button>
          </div>
        </div>
      </Card>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl p-4">
          <p className="text-green-700 dark:text-green-300">{success}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Users Table */}
      <Card padding="none" className="overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-100 dark:divide-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12">
                    <div className="empty-state">
                      <div className="empty-state-icon">
                        <FiUsers className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 font-medium">No users found</p>
                      <p className="text-slate-400 dark:text-slate-500 text-sm">Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="shrink-0 w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center">
                          <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-slate-900 dark:text-white">{user.name}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Badge className={getRoleBadgeColor(user.role)}>
                          {getRoleDisplayName(user.role)}
                        </Badge>
                        {user.deleted_at && (
                          <Badge className="bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800">
                            Deleted
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-1">
                        {!user.deleted_at && (
                          <>
                            <button
                              onClick={() => handleEdit(user)}
                              className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <FiEdit2 className="w-4 h-4" />
                            </button>
                            {user.role !== 'super_admin' && (
                              <button
                                onClick={() => handleDelete(user)}
                                className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                            )}
                          </>
                        )}
                        {user.deleted_at && (
                          <button
                            onClick={() => handleRestore(user.id.toString())}
                            className="p-2 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/30 rounded-lg transition-colors"
                            title="Restore"
                          >
                            <FiRefreshCw className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="empty-state py-8">
              <div className="empty-state-icon">
                <FiUsers className="w-8 h-8 text-slate-400 dark:text-slate-500" />
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-medium">No users found</p>
              <p className="text-slate-400 dark:text-slate-500 text-sm">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {users.map((user) => (
                <div key={user.id} className="p-4 sm:p-5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="shrink-0 w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center">
                        <span className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                        {user.deleted_at && (
                          <Badge className="mt-1 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800 text-xs">
                            Deleted
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Badge className={`${getRoleBadgeColor(user.role)} shrink-0 text-xs`}>
                      {getRoleDisplayName(user.role)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 gap-3">
                    <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0">{formatDate(user.created_at)}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      {!user.deleted_at && (
                        <>
                          <button
                            onClick={() => handleEdit(user)}
                            className="p-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          {user.role !== 'super_admin' && (
                            <button
                              onClick={() => handleDelete(user)}
                              className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          )}
                        </>
                      )}
                      {user.deleted_at && (
                        <button
                          onClick={() => handleRestore(user.id.toString())}
                          className="p-1.5 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/30 rounded-lg transition-colors"
                          title="Restore"
                        >
                          <FiRefreshCw className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
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
                onClick={() => fetchUsers(meta.current_page - 1)}
              >
                Prev
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="flex-1 sm:flex-none"
                disabled={meta.current_page === meta.last_page}
                onClick={() => fetchUsers(meta.current_page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Create/Edit Modal */}
      {showModal && (
        <UserModal
          user={editingUser}
          errors={modalErrors}
          onClose={() => {
            setShowModal(false);
            setEditingUser(null);
            setModalErrors({});
            reset();
          }}
          onSubmit={onSubmit}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingUser && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full mx-4 animate-slide-up">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-xl">
                <FiTrash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Delete User</h3>
            </div>
            {deletingUser.merchant ? (
              <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-yellow-800 dark:text-yellow-300 text-sm">
                  <strong>Warning:</strong> This user has an associated merchant "{deletingUser.merchant.business_name}" that will also be deleted.
                </p>
              </div>
            ) : null}
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              Are you sure you want to delete <span className="font-medium text-slate-900 dark:text-white">{deletingUser.name}</span>?
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <Button variant="secondary" onClick={() => setDeletingUser(null)}>
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

// User Modal Component
interface UserModalProps {
  user: User | null;
  errors?: Record<string, string>;
  onClose: () => void;
  onSubmit: (data: UserFormData) => void;
}

function UserModal({ user, errors = {}, onClose, onSubmit }: UserModalProps) {
  const [password, setPassword] = useState('');
  
  // Use different schemas for create vs update
  const schema = user ? updateUserSchema : createUserSchema;
  
  const { register, handleSubmit, formState: { errors: formErrors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: user
      ? {
          name: user.name,
          email: user.email,
          role: user.role as 'admin' | 'merchant',
        }
      : {
          role: 'merchant' as const,
        },
  });

  const roleOptions = [
    { value: 'admin', label: 'Administrator' },
    { value: 'merchant', label: 'Merchant' },
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/50 dark:bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            {user ? 'Edit User' : 'Create User'}
          </h3>
        </div>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <form onSubmit={(e) => void handleSubmit(onSubmit as any)(e)} className="p-6 space-y-4">
          {errors._general && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-red-700 dark:text-red-300 text-sm">{errors._general}</p>
            </div>
          )}

          <Input
            label="Full Name"
            error={formErrors.name?.message || errors.name}
            {...register('name')}
            className="input-focus"
          />
          <Input
            label="Email"
            type="email"
            error={formErrors.email?.message || errors.email}
            {...register('email')}
            className="input-focus"
          />
          {!user && (
            <>
              <Input
                label="Password"
                type="password"
                error={formErrors.password?.message || errors.password}
                {...register('password', {
                  onChange: (e) => setPassword(e.target.value),
                })}
                className="input-focus"
              />
              <Input
                label="Confirm Password"
                type="password"
                error={formErrors.password_confirmation?.message || errors.password_confirmation}
                {...register('password_confirmation')}
                className="input-focus"
              />
            </>
          )}
          {user && (
            <>
              <Input
                label="Password (leave blank to keep current)"
                type="password"
                error={formErrors.password?.message || errors.password}
                {...register('password', {
                  onChange: (e) => setPassword(e.target.value),
                })}
                className="input-focus"
              />
              {password && (
                <Input
                  label="Confirm New Password"
                  type="password"
                  error={formErrors.password_confirmation?.message || errors.password_confirmation}
                  {...register('password_confirmation')}
                  className="input-focus"
                />
              )}
            </>
          )}
          <Select
            label="Role"
            options={roleOptions}
            error={formErrors.role?.message || errors.role}
            {...register('role')}
          />
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{user ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

