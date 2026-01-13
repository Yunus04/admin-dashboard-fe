import client from './client';

// Types
export interface ProfileUpdateData {
  name: string;
}

export interface PasswordChangeData {
  current_password: string;
  password: string;
  password_confirmation: string;
}

// Profile APIs
export const profileApi = {
  update: (data: ProfileUpdateData) =>
    client.patch('/settings/profile', data),

  get: () =>
    client.get('/settings/profile'),
};

// Password APIs
export const passwordApi = {
  change: (data: PasswordChangeData) =>
    client.post('/settings/change-password', data),
};

// Combined settings API
const settingsApi = {
  profile: profileApi,
  password: passwordApi,
};

export default settingsApi;

