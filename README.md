# Admin Dashboard Frontend

A modern React 19 + TypeScript admin dashboard with role-based access control, integrated with a Laravel backend API.

## Features

- **Authentication System**: Login, Logout, Forgot Password, Reset Password
- **Role-Based Access Control (RBAC)**:
  - Super Admin: Full access to all features including user management
  - Admin: Manage merchants only, cannot manage other admins
  - Merchant: View own dashboard data only
- **Dashboard**: Role-specific dashboard views with statistics
- **User Management**: CRUD operations for users (Super Admin only)
- **Merchant Management**: CRUD operations for merchants
- **Settings**: Profile and password management
- **Responsive Design**: Mobile-friendly UI with Tailwind CSS
- **TypeScript**: Full type safety throughout the application

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS v4
- React Router v7
- Axios
- React Hook Form
- React Icons (Feather Icons)

## Project Structure

```
src/
├── api/                    # API layer
│   ├── auth.ts            # Auth endpoints
│   ├── client.ts          # Axios instance with interceptors
│   ├── dashboard.ts       # Dashboard endpoints
│   ├── merchants.ts       # Merchant endpoints
│   ├── settings.ts        # Settings endpoints
│   └── users.ts           # User endpoints
├── assets/                # Static assets
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components (Button, Card, Input, etc.)
│   └── layout/           # Layout components (Header, MainLayout)
├── contexts/             # React Contexts
│   ├── AuthContext.tsx   # Authentication state management
│   └── ThemeContext.tsx  # Theme management
├── hooks/                # Custom React hooks
│   └── usePermission.ts  # Permission checking hook
├── pages/                # Page components
│   ├── auth/             # Auth pages (Login, ForgotPassword, ResetPassword)
│   ├── dashboard/        # Dashboard page
│   ├── merchants/        # Merchant management pages
│   ├── settings/         # Settings page
│   └── users/            # User management pages
├── routes/               # Routing configuration
│   └── AppRoutes.tsx     # Main router with route guards
├── types/                # TypeScript types
│   └── models.ts         # Model types (User, Merchant, etc.)
├── utils/                # Utility functions
├── App.tsx               # Main App component
└── main.tsx              # Entry point
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create environment file:
   ```bash
   cp .env.example .env.local
   ```

3. Configure your API URL in `.env.local`:
   ```
   VITE_API_BASE_URL=http://localhost:8000/api
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Frontend Routes

| Route | Description | Access |
|-------|-------------|--------|
| `/login` | Login page | Public |
| `/forgot-password` | Forgot password page | Public |
| `/reset-password` | Reset password page | Public |
| `/dashboard` | Dashboard with role-specific data | Authenticated |
| `/users` | User management | Super Admin only |
| `/merchants` | Merchant management | Super Admin, Admin |
| `/settings` | User settings (profile, password) | Authenticated |

### Route Guards

The application uses route guards to protect routes based on user roles:

```typescript
// ProtectedRoute with role-based access
<ProtectedRoute allowedRoles={['super_admin']}>
  <UsersPage />
</ProtectedRoute>

<ProtectedRoute allowedRoles={['super_admin', 'admin']}>
  <MerchantsPage />
</ProtectedRoute>
```

## API Configuration

The frontend is configured to connect to a Laravel backend. Make sure your backend is running at the URL specified in `.env.local`.

### Expected API Endpoints

#### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/logout` | Logout |
| POST | `/api/auth/refresh` | Refresh token |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password |

#### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List all users (Super Admin) |
| POST | `/api/users` | Create new user (Super Admin) |
| GET | `/api/users/{id}` | Get user details |
| PUT | `/api/users/{id}` | Update user |
| DELETE | `/api/users/{id}` | Delete user |
| POST | `/api/users/{id}/restore` | Restore user |

#### Merchants

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/merchants` | List merchants (filtered by role) |
| POST | `/api/merchants` | Create merchant |
| GET | `/api/merchants/{id}` | Get merchant details |
| PUT | `/api/merchants/{id}` | Update merchant |
| DELETE | `/api/merchants/{id}` | Delete merchant |

#### Dashboard & Settings

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard` | Get dashboard data |
| GET | `/api/settings/profile` | Get user profile |
| PATCH | `/api/settings/profile` | Update profile |
| POST | `/api/settings/change-password` | Change password |

## Authentication Flow

1. User logs in at `/login`
2. On success, receives Bearer token
3. Token stored in localStorage
4. AuthContext manages authentication state
5. Protected routes check authentication and roles
6. API requests include Authorization header

```typescript
// AuthContext provides:
- isAuthenticated: boolean
- user: User | null
- login(credentials): Promise<void>
- logout(): Promise<void>
```

## Role-Based Access Control

### Frontend Implementation

The frontend enforces RBAC at multiple levels:

1. **Route Guards**: Prevent unauthorized route access
2. **Component Rendering**: Hide/show elements based on user role
3. **API Requests**: Backend validates permissions

### Role-Based Dashboard

```typescript
// Dashboard shows different data based on role
if (user.role === 'super_admin') {
  // Show all statistics
} else if (user.role === 'admin') {
  // Show merchant statistics only
} else {
  // Show own merchant profile
}
```

### Admin Restrictions

- Admins cannot access `/users` page
- Admins cannot create other Admin accounts
- Admins can only manage Merchants

## Building for Production

```bash
# Build the application
npm run build

# Preview production build
npm run preview
```

The built files will be in the `dist` directory.

## State Management

### AuthContext

The `AuthContext` manages authentication state throughout the application:

```typescript
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}
```

### API Client

Axios configured with interceptors for:

- Automatic token injection
- Error handling
- Request/response logging

## Error Handling

The application handles errors gracefully:

- Authentication errors redirect to login
- Permission denied shows appropriate message
- Form validation errors displayed inline
- Network errors show toast notifications

## Development Scripts

```bash
# Start development server
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Build for production
npm run build
```

## Dependencies

### Main Dependencies

- `react` ^19.0.0
- `react-dom` ^19.0.0
- `react-router-dom` ^7.0.0
- `axios` ^1.7.0
- `react-hook-form` ^7.51.0
- `@hookform/resolvers` ^3.3.0
- `zod` ^3.22.0
- `react-icons` ^5.2.0
- `clsx` ^2.1.0
- `tailwind-merge` ^2.3.0

### Dev Dependencies

- `typescript` ^5.4.0
- `vite` ^5.2.0
- `@types/react` ^18.2.0
- `@types/react-dom` ^18.2.0
- `tailwindcss` ^3.4.0
- `postcss` ^8.4.0
- `autoprefixer` ^10.4.0
- `eslint` ^8.57.0

## Testing

This project uses **Vitest** for unit testing, following the same testing patterns as the backend Laravel project.

### Installation

```bash
npm install
```

### Running Tests

```bash
# Run tests in watch mode
npm test

# Run tests once (CI mode)
npm run test:run

# Run tests with coverage
npm run test:coverage
```

### Test Structure

```
src/
├── test/
│   └── setup.ts              # Test setup and global mocks
├── validations/
│   └── schemas/
│       ├── auth.test.ts       # Auth validation tests
│       ├── user.test.ts       # User validation tests
│       └── auth.ts           # Login, Register, Forgot/Reset Password schemas
├── hooks/
│   └── usePermission.test.ts  # Permission/RBAC logic tests
└── lib/
    └── utils.test.ts          # Utility function tests
```

### Test Coverage

Tests cover:

1. **Validation Schemas**
   - Login form validation
   - Register form validation
   - Password reset validation
   - User CRUD validation

2. **Permission Logic (RBAC)**
   - Super Admin permissions
   - Admin permissions
   - Merchant permissions
   - Route access control

3. **Utility Functions**
   - Tailwind class merging (`cn`)

### Example Test

```typescript
import { describe, it, expect } from 'vitest';
import { loginSchema } from '@/validations/schemas/auth';

describe('loginSchema', () => {
  it('should validate valid login data', () => {
    const validData = {
      email: 'test@example.com',
      password: 'password123',
    };
    const result = loginSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should reject invalid email format', () => {
    const invalidData = {
      email: 'not-an-email',
      password: 'password123',
    };
    const result = loginSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
```

For more details, see [TESTING.md](./TESTING.md).

---

## Environment Variables

Create a `.env.local` file in the root directory:

```env
# API Base URL (pointing to Laravel backend)
VITE_API_BASE_URL=http://localhost:8000/api

# Application Name
VITE_APP_NAME=Admin Dashboard
```

---

## Features Status

### ✅ Completed Features

#### 1. Authentication
| Feature | Status | Description |
|---------|--------|-------------|
| User Login | ✅ Complete | Login with email/password, token-based authentication |
| User Registration | ✅ Complete | Registration form with validation |
| Forgot Password | ✅ Complete | Request password reset via email |
| Reset Password | ✅ Complete | Reset password with token |
| Logout | ✅ Complete | Logout and clear session |

#### 2. User Roles & Permissions
| Role | Status | Description |
|------|--------|-------------|
| Super Admin | ✅ Complete | Full access to all features including user management |
| Admin | ✅ Complete | Manage merchants only, cannot access user management |
| Merchant | ✅ Complete | Only access own dashboard and data |

#### 3. CRUD Operations
| Feature | Status | Description |
|---------|--------|-------------|
| User CRUD | ✅ Complete | Create, Read, Update, Delete users (Super Admin only) |
| Merchant CRUD | ✅ Complete | Create, Read, Update, Delete merchants |
| Settings | ✅ Complete | Profile and password management |

#### 4. Dashboard
| Feature | Status | Description |
|---------|--------|-------------|
| Super Admin Dashboard | ✅ Complete | Display all statistics |
| Admin Dashboard | ✅ Complete | Display merchant statistics only |
| Merchant Dashboard | ✅ Complete | Display logged-in merchant's data |

#### 5. Bonus Features
| Feature | Status | Description |
|---------|--------|-------------|
| Unit Testing | ✅ Complete | Vitest setup with auth, user, permission tests |
| Route Protection | ✅ Complete | ProtectedRoute with role-based access |
| Input Validation | ✅ Complete | Zod schemas for all forms |
| TypeScript | ✅ Complete | Full type safety throughout the application |
| Responsive UI | ✅ Complete | Tailwind CSS v4, mobile-friendly |

### ⏳ In Progress / Uncompleted Features

| Feature | Status | Notes |
|---------|--------|-------|
| Deployment | ⏳ Pending | Needs deployment to a public server |
| Integration Tests | ⏳ Pending | Only unit tests are currently implemented |

**Note:** API Documentation and Email Integration are handled by the backend team.

## Submission Checklist

- [x] Source code in GitHub repository
- [x] README with setup instructions
- [x] Authentication Features (Login, Register, Forgot/Reset Password, Logout)
- [x] Role-Based Access Control (Super Admin, Admin, Merchant)
- [x] CRUD Operations for Users and Merchants
- [x] Dashboard with role-specific data
- [x] Unit tests
- [x] Route protection and input validation
- [ ] Deployment to a public server

## Backend Requirement

**Important:** This frontend application requires a backend API to function properly. Recommended backend:

- **Laravel** (recommended): Separate backend API repository
- Ensure backend provides endpoints as listed in "Expected API Endpoints" section
- Configure `VITE_API_BASE_URL` in `.env.local` to point to your backend URL

## Contact

For repository access: **support@ripos.asia**

---

## License

MIT License

