import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/AuthContext';
import { Input, Button, Card, Select } from '@/components/ui';
import { FiMail, FiLock, FiUser, FiUserPlus, FiAlertCircle } from 'react-icons/fi';
import { registerSchema, type RegisterFormData } from '@/validations';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register: registerUser, isLoading, isAuthenticated } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
      role: 'merchant',
    },
  });

  // Navigate to dashboard when authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  const onSubmit = async (data: RegisterFormData) => {
    setError(null);
    try {
      await registerUser(data);
    } catch (err: unknown) {
      // Debug: Log the full error to see the structure
      console.error('Register error details:', err);

      // Extract error message from API response - handle different possible structures
      let errorMessage = 'Registration failed. Please try again.';

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

  const roleOptions = [
    { value: 'admin', label: 'Administrator' },
    { value: 'merchant', label: 'Merchant' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-600 rounded-xl mb-4">
            <span className="text-white font-bold text-lg">AD</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">AdminPanel</h1>
          <p className="text-gray-500 mt-1">Create a new account</p>
        </div>

        <Card>
          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
              <FiAlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="space-y-5">
            <div>
              <Input
                label="Full Name"
                type="text"
                placeholder="John Doe"
                leftIcon={<FiUser className="w-4 h-4" />}
                error={errors.name?.message}
                {...register('name')}
              />
            </div>

            <div>
              <Input
                label="Email address"
                type="email"
                placeholder="john@example.com"
                leftIcon={<FiMail className="w-4 h-4" />}
                error={errors.email?.message}
                {...register('email')}
              />
            </div>

            <div>
              <Select
                label="Role"
                placeholder="Select a role"
                options={roleOptions}
                error={errors.role?.message}
                {...register('role')}
              />
            </div>

            <div>
              <Input
                label="Password"
                type="password"
                placeholder="Create a password"
                leftIcon={<FiLock className="w-4 h-4" />}
                error={errors.password?.message}
                {...register('password')}
              />
            </div>

            <div>
              <Input
                label="Confirm Password"
                type="password"
                placeholder="Confirm your password"
                leftIcon={<FiLock className="w-4 h-4" />}
                error={errors.password_confirmation?.message}
                {...register('password_confirmation')}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isLoading}
            >
              <FiUserPlus className="w-4 h-4 mr-2" />
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Sign in
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

