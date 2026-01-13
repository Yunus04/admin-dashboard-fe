import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/AuthContext';
import { Input, Button, Card } from '@/components/ui';
import { FiMail, FiArrowLeft, FiKey } from 'react-icons/fi';
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/validations';

export function ForgotPasswordPage() {
  const { forgotPassword, isLoading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (formData: ForgotPasswordFormData) => {
    setError(null);
    try {
      const response = await forgotPassword(formData.email);

      // If response is null or doesn't contain reset_token, email is not registered
      if (!response || !response.reset_token) {
        setError('Email is not registered in the system');
        return;
      }

      // Redirect to reset password page with token in URL
      navigate(`/reset-password?email=${encodeURIComponent(formData.email)}&token=${encodeURIComponent(response.reset_token)}`);
    } catch (err: unknown) {
      console.error('Forgot password error details:', err);
      let errorMessage = 'Failed to send password reset instructions. Please try again.';
      const axiosError = err as {
        response?: {
          data?: {
            message?: string;
            success?: boolean;
          }
        };
        message?: string
      };

      if (axiosError.response?.data) {
        const responseData = axiosError.response.data;
        if (typeof responseData === 'string') {
          errorMessage = responseData;
        } else if (typeof responseData === 'object' && responseData.message) {
          errorMessage = responseData.message;
        }
      } else if (axiosError.message) {
        errorMessage = axiosError.message;
      }
      setError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-600 rounded-xl mb-4">
            <span className="text-white font-bold text-lg">AD</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">AdminPanel</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Reset your password</p>
        </div>

        <Card>
          <div className="text-center mb-6">
            <div className="mx-auto flex items-center justify-center w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-full mb-4">
              <FiKey className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Forgot your password?
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Enter your email address and we will send you instructions to reset your password.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="space-y-5">
            <div>
              <Input
                label="Email address"
                type="email"
                placeholder="admin@admin.com"
                leftIcon={<FiMail className="w-4 h-4" />}
                error={errors.email?.message}
                {...register('email')}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isLoading}
            >
              Send Reset Instructions
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            >
              <FiArrowLeft className="w-4 h-4 mr-1" />
              Back to login
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

