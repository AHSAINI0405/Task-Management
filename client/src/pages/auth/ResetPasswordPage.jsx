import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from '../../api/auth.api.js';
import Input from '../../components/ui/Input.jsx';
import Button from '../../components/ui/Button.jsx';

const schema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const onSubmit = async (data) => {
    try {
      await authApi.resetPassword(token, { password: data.password });
      toast.success('Password reset successfully! Please log in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired token.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-950">
      <div className="card w-full max-w-md p-8 shadow-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-brand-600 dark:text-brand-400">MyTracker</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Set a new password</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="New Password"
            type="password"
            placeholder="At least 8 characters"
            error={errors.password?.message}
            required
            {...register('password')}
          />
          <Input
            label="Confirm New Password"
            type="password"
            placeholder="Re-enter password"
            error={errors.confirmPassword?.message}
            required
            {...register('confirmPassword')}
          />

          <Button type="submit" loading={isSubmitting} className="w-full">
            Reset Password
          </Button>

          <div className="text-center mt-4">
            <Link to="/login" className="text-xs text-brand-600 dark:text-brand-400 hover:underline">
              Back to Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
