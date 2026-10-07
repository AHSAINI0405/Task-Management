import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from '../../api/auth.api.js';
import Input from '../../components/ui/Input.jsx';
import Button from '../../components/ui/Button.jsx';

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data) => {
    try {
      await authApi.forgotPassword(data);
      setSubmitted(true);
      toast.success('Password reset email sent!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-950">
      <div className="card w-full max-w-md p-8 shadow-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-brand-600 dark:text-brand-400">MyTracker</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Reset your password</p>
        </div>

        {submitted ? (
          <div className="text-center space-y-4">
            <div className="p-3 bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300 rounded-lg text-sm">
              If an account with that email exists, we've sent password reset instructions.
            </div>
            <Link to="/login" className="btn btn-secondary w-full inline-block text-center">
              Back to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Enter your account's email address and we'll send you a link to reset your password.
            </p>
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              required
              {...register('email')}
            />

            <Button type="submit" loading={isSubmitting} className="w-full">
              Send Reset Link
            </Button>

            <div className="text-center mt-4">
              <Link to="/login" className="text-xs text-brand-600 dark:text-brand-400 hover:underline">
                Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
