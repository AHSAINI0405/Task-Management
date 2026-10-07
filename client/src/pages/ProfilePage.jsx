import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import { profileApi } from '../api/api.js';
import Input, { SelectField } from '../components/ui/Input.jsx';
import Button from '../components/ui/Button.jsx';
import PushSubscribeButton from '../components/notifications/PushSubscribeButton.jsx';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  timezone: z.string().min(1, 'Timezone is required'),
  notifyByEmail: z.boolean(),
  notifyByPush: z.boolean(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

const COMMON_TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Australia/Sydney',
];

export default function ProfilePage() {
  const { user, updateUser } = useAuth();

  const {
    register: regProfile,
    handleSubmit: submitProfile,
    formState: { errors: profileErrors, isSubmitting: isProfileSubmitting },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      timezone: user?.timezone || 'UTC',
      notifyByEmail: user?.notifyByEmail ?? true,
      notifyByPush: user?.notifyByPush ?? true,
    },
  });

  const {
    register: regPassword,
    handleSubmit: submitPassword,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting },
  } = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '' },
  });

  const onUpdateProfile = async (data) => {
    try {
      const res = await profileApi.update(data);
      updateUser(res.data.data.user);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const onChangePassword = async (data) => {
    try {
      await profileApi.changePassword(data);
      toast.success('Password changed successfully');
      resetPasswordForm();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Profile Details */}
      <div className="card p-6 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Profile Settings</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Manage your personal information, timezone, and reminder channels.
          </p>
        </div>

        <form onSubmit={submitProfile(onUpdateProfile)} className="space-y-4">
          <Input
            label="Name"
            error={profileErrors.name?.message}
            required
            {...regProfile('name')}
          />

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <input
              type="text"
              disabled
              value={user?.email || ''}
              className="input-base mt-1 bg-gray-50 dark:bg-gray-800/40 text-gray-500 cursor-not-allowed"
            />
          </div>

          <SelectField label="Timezone" error={profileErrors.timezone?.message} {...regProfile('timezone')}>
            {COMMON_TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </SelectField>

          <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-700">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Notification Channels
            </p>
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
              <input type="checkbox" className="rounded" {...regProfile('notifyByEmail')} />
              Receive email notifications
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
              <input type="checkbox" className="rounded" {...regProfile('notifyByPush')} />
              Receive browser web-push notifications
            </label>
            <div className="pt-2">
              <PushSubscribeButton />
            </div>
          </div>

          <Button type="submit" loading={isProfileSubmitting}>
            Save Preferences
          </Button>
        </form>
      </div>

      {/* Change Password */}
      <div className="card p-6 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Security</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Update your account password.
          </p>
        </div>

        <form onSubmit={submitPassword(onChangePassword)} className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            error={passwordErrors.currentPassword?.message}
            required
            {...regPassword('currentPassword')}
          />
          <Input
            label="New Password"
            type="password"
            error={passwordErrors.newPassword?.message}
            required
            {...regPassword('newPassword')}
          />

          <Button type="submit" variant="secondary" loading={isPasswordSubmitting}>
            Update Password
          </Button>
        </form>
      </div>
    </div>
  );
}
