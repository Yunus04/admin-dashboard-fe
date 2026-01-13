import { useState, useEffect, type FormEvent } from 'react';
import { Card, Button, Input } from '@/components/ui';
import { FiUser, FiLock } from 'react-icons/fi';
import settingsApi from '@/api/settings';
import type {
  ProfileUpdateData,
  PasswordChangeData,
} from '@/api/settings';
import { useAuth } from '@/contexts/AuthContext';

export function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Profile form state
  const [profileData, setProfileData] = useState<ProfileUpdateData>({
    name: '',
  });

  // Password form state
  const [passwordData, setPasswordData] = useState<PasswordChangeData>({
    current_password: '',
    password: '',
    password_confirmation: '',
  });

  // Load initial data
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
      });
    }
  }, [user]);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  // Profile handlers
  const handleProfileSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await settingsApi.profile.update(profileData);
      await refreshUser(); // Refresh user data in context
      showMessage('success', 'Profile updated successfully');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      showMessage('error', err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // Password handlers
  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (passwordData.password !== passwordData.password_confirmation) {
      showMessage('error', 'Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await settingsApi.password.change(passwordData);
      showMessage('success', 'Password changed successfully');
      setPasswordData({ current_password: '', password: '', password_confirmation: '' });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      showMessage('error', err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your account settings and preferences</p>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'}`}>
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all ${
            activeTab === 'profile'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FiUser className="w-4 h-4 mr-2" />
          Profile
        </button>
        <button
          onClick={() => setActiveTab('password')}
          className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all ${
            activeTab === 'password'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FiLock className="w-4 h-4 mr-2" />
          Password
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <Card>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Profile Information</h2>
          <form onSubmit={handleProfileSubmit} className="space-y-4 max-w-md">
            <Input
              label="Full Name"
              placeholder="Enter your name"
              value={profileData.name}
              onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
              required
            />
            <Input
              label="Email"
              type="email"
              placeholder="Enter your email"
              value={user?.email || ''}
              disabled
              className="bg-slate-50 dark:bg-slate-700"
            />
            <div className="pt-4">
              <Button type="submit" isLoading={loading}>Save Changes</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Password Tab */}
      {activeTab === 'password' && (
        <Card>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Change Password</h2>
          <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
            <Input
              label="Current Password"
              type="password"
              placeholder="Enter current password"
              value={passwordData.current_password}
              onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
              required
            />
            <Input
              label="New Password"
              type="password"
              placeholder="Enter new password"
              value={passwordData.password}
              onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
              required
            />
            <Input
              label="Confirm New Password"
              type="password"
              placeholder="Confirm new password"
              value={passwordData.password_confirmation}
              onChange={(e) => setPasswordData({ ...passwordData, password_confirmation: e.target.value })}
              required
            />
            <div className="pt-4">
              <Button type="submit" isLoading={loading}>Update Password</Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}
