import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoginPage, ForgotPasswordPage, ResetPasswordPage } from '@/pages/auth';
import { DashboardPage, SettingsPage } from '@/pages';
import { UsersPage, UsersListingPage } from '@/pages/users';
import { MerchantsPage, MerchantsListingPage } from '@/pages/merchants';
import { MainLayout } from '@/components/layout';
import type { UserRole } from '@/types/models';

// Protected Route Wrapper
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

// eslint-disable-next-line react-refresh/only-export-components
function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

// Auth Route Wrapper (redirect if already logged in)
interface AuthRouteProps {
  children: React.ReactNode;
}

// eslint-disable-next-line react-refresh/only-export-components
function AuthRoute({ children }: AuthRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

// Router Configuration
export const router = createBrowserRouter([
  // Auth Routes (public)
  {
    path: '/login',
    element: (
      <AuthRoute>
        <LoginPage />
      </AuthRoute>
    ),
  },
  {
    path: '/forgot-password',
    element: (
      <AuthRoute>
        <ForgotPasswordPage />
      </AuthRoute>
    ),
  },
  {
    path: '/reset-password',
    element: (
      <AuthRoute>
        <ResetPasswordPage />
      </AuthRoute>
    ),
  },

  // Protected Routes
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'users',
        element: (
          <ProtectedRoute allowedRoles={['super_admin']}>
            <UsersPage />
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: <UsersListingPage />,
          },
        ],
      },
      {
        path: 'merchants',
        element: (
          <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
            <MerchantsPage />
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: <MerchantsListingPage />,
          },
        ],
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
    ],
  },

  // Catch all - redirect to dashboard
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
]);
