import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, Button, Input } from '@/components/ui';
import { FiArrowLeft, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { resetPasswordSchema, type ResetPasswordFormData } from '@/validations';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { resetPassword } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Load email and token from URL params
  useEffect(() => {
    const email = searchParams.get('email') || '';
    const token = searchParams.get('token') || '';
    if (email || token) {
      setIsReady(true);
    }
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: searchParams.get('email') || '',
      token: searchParams.get('token') || '',
      password: '',
      password_confirmation: '',
    },
  });

  // Update form values when URL params change
  useEffect(() => {
    const email = searchParams.get('email') || '';
    const token = searchParams.get('token') || '';
    setValue('email', email);
    setValue('token', token);
    setIsReady(true);
  }, [searchParams, setValue]);

  const password = watch('password', '');

  const onSubmit = async (data: ResetPasswordFormData) => {
    setLoading(true);
    setMessage(null);

    try {
      await resetPassword({
        email: data.email,
        token: data.token,
        password: data.password,
        password_confirmation: data.password_confirmation,
      });

      setMessage({
        type: 'success',
        text: 'Password reset successfully! Redirecting to login...'
      });

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (error: unknown) {
      console.error('Reset password error:', error);

      // Extract error message
      const axiosError = error as {
        response?: {
          data?: {
            message?: string;
            errors?: Record<string, string[]>;
          }
        };
        message?: string
      };

      let errorMessage = 'Failed to reset password. Please check your token and try again.';

      // Check for validation errors first
      if (axiosError.response?.data?.errors) {
        const errors = axiosError.response.data.errors;
        const errorParts: string[] = [];
        if (errors.email) errorParts.push(`Email: ${errors.email.join(', ')}`);
        if (errors.token) errorParts.push(`Token: ${errors.token.join(', ')}`);
        if (errors.password) errorParts.push(`Password: ${errors.password.join(', ')}`);
        if (errorParts.length > 0) {
          errorMessage = errorParts.join('. ');
        }
      } else if (axiosError.response?.data?.message) {
        errorMessage = axiosError.response.data.message;
      } else if (axiosError.message) {
        errorMessage = axiosError.message;
      }

      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-indigo-600 rounded-full flex items-center justify-center">
            <FiLock className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-slate-900 dark:text-white">
            Reset your password
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Enter your new password below
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className={`p-4 rounded-lg ${message.type === 'success'
              ? 'bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300'
              : 'bg-red-50 text-red-700 dark:bg-red-900 dark:text-red-300'
            }`}>
            {message.text}
          </div>
        )}

        {/* Form */}
        <Card>
          <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="space-y-6">
            <Input
              label="Email"
              type="email"
              placeholder="Enter your email"
              error={errors.email?.message}
              {...register('email')}
              required
              disabled={loading}
            />

            {/* Hidden token field - auto-filled from URL params */}
            <input type="hidden" {...register('token')} />

            <div className="relative">
              <Input
                label="New Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter new password"
                error={errors.password?.message}
                {...register('password')}
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
              </button>
            </div>

            <div className="relative">
              <Input
                label="Confirm New Password"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm new password"
                error={errors.password_confirmation?.message}
                {...register('password_confirmation')}
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-9 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                {showConfirmPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
              </button>
            </div>

            {/* Password Requirements */}
            {password && (
              <div className="text-sm space-y-1">
                <p className="font-medium text-slate-700 dark:text-slate-300">Password requirements:</p>
                <div className="space-y-1 text-slate-600 dark:text-slate-400">
                  <div className={`flex items-center ${password.length >= 8 ? 'text-green-600' : 'text-red-600'}`}>
                    <span className="mr-2">{password.length >= 8 ? '✓' : '✗'}</span>
                    At least 8 characters
                  </div>
                  <div className={`flex items-center ${/[A-Z]/.test(password) ? 'text-green-600' : 'text-red-600'}`}>
                    <span className="mr-2">{/[A-Z]/.test(password) ? '✓' : '✗'}</span>
                    One uppercase letter
                  </div>
                  <div className={`flex items-center ${/[a-z]/.test(password) ? 'text-green-600' : 'text-red-600'}`}>
                    <span className="mr-2">{/[a-z]/.test(password) ? '✓' : '✗'}</span>
                    One lowercase letter
                  </div>
                  <div className={`flex items-center ${/\d/.test(password) ? 'text-green-600' : 'text-red-600'}`}>
                    <span className="mr-2">{/\d/.test(password) ? '✓' : '✗'}</span>
                    One number
                  </div>
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              isLoading={loading}
              disabled={!isReady || !password}
            >
              Reset Password
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300"
            >
              <FiArrowLeft className="w-4 h-4 mr-2" />
              Back to login
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

