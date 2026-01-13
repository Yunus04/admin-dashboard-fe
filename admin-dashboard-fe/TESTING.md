# Frontend Testing Setup

This project uses **Vitest** for unit testing, following the same testing patterns as the backend Laravel project.

## Installation

Before running tests, install the dependencies:

```bash
cd admin-dashboard-fe
npm install
```

## Running Tests

```bash
# Run tests in watch mode
npm test

# Run tests once (CI mode)
npm run test:run

# Run tests with coverage
npm run test:coverage
```

## Test Structure

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

## Test Coverage

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

## Test Files

### 1. Auth Validation Tests (`src/validations/schemas/auth.test.ts`)

Tests for authentication form validation using Zod schemas:

```typescript
describe('loginSchema', () => {
  it('should validate valid login data', () => {
    const validData = {
      email: 'test@example.com',
      password: 'password123',
    };
    const result = loginSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });
});
```

**Test cases:**
- Valid email and password
- Invalid email format
- Empty email
- Empty password
- Password too short

### 2. User Validation Tests (`src/validations/schemas/user.test.ts`)

Tests for user management form validation:

```typescript
describe('createUserSchema', () => {
  it('should validate valid create user data', () => {
    const validData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      password_confirmation: 'password123',
      role: 'admin',
    };
    const result = createUserSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });
});
```

**Test cases:**
- Valid user data with all fields
- Mismatched passwords
- Password too short
- Name too short
- Invalid role
- Empty fields

### 3. Permission Tests (`src/hooks/usePermission.test.ts`)

Tests for role-based access control logic:

```typescript
describe('Role-based Permissions', () => {
  it('should return correct permissions for super_admin', () => {
    const permissions = getPermissions('super_admin');
    expect(permissions.canViewUsers).toBe(true);
    expect(permissions.canDeleteUsers).toBe(true);
  });
});
```

**Test cases:**
- Super Admin has all permissions
- Admin cannot manage users
- Merchant has limited permissions
- hasPermission checks for each role
- Route access control

### 4. Utility Tests (`src/lib/utils.test.ts`)

Tests for utility functions:

```typescript
describe('cn - Tailwind class merger', () => {
  it('should merge classes correctly', () => {
    const result = cn('text-red-500', 'bg-blue-500');
    expect(result).toContain('text-red-500');
    expect(result).toContain('bg-blue-500');
  });
});
```

**Test cases:**
- Merge multiple classes
- Handle conditional classes
- Handle false conditionals
- Merge conflicting classes
- Handle empty inputs
- Handle null and undefined
- Handle array inputs

## Example Test

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

## Writing New Tests

### 1. Test Location

- Put component tests in the same directory as the component
- Put utility/hook tests in `src/lib/` or `src/hooks/`
- Put validation tests in `src/validations/schemas/`

### 2. Test File Naming

- Use `.test.ts` or `.test.tsx` extension
- Example: `MyComponent.test.tsx`

### 3. Test Structure

```typescript
import { describe, it, expect } from 'vitest';
import { myFunction } from '@/path/to/module';

describe('Module Name', () => {
  describe('functionName - specific behavior', () => {
    it('should do something expected', () => {
      const input = 'test input';
      const result = myFunction(input);
      expect(result).toBe('expected output');
    });

    it('should handle edge case', () => {
      // Test edge case
    });
  });
});
```

## Integration with CI/CD

Add to your CI pipeline:

```yaml
- name: Install dependencies
  working-directory: ./admin-dashboard-fe
  run: npm ci

- name: Run tests
  working-directory: ./admin-dashboard-fe
  run: npm run test:run

- name: Upload coverage
  working-directory: ./admin-dashboard-fe
  run: npm run test:coverage
```

## Coverage Report

After running `npm run test:coverage`, the coverage report will be available in:

```
coverage/
├── index.html  # HTML report
└── ...         # Other formats
```

Open `coverage/index.html` in a browser to view the detailed coverage report.

## Best Practices

1. **Test behavior, not implementation**
2. **Use descriptive test names**
3. **Test edge cases and error conditions**
4. **Keep tests independent**
5. **Follow the AAA pattern**: Arrange, Act, Assert

## Related Documentation

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library React](https://testing-library.com/docs/react-testing-library/intro/)
- [Zod Documentation](https://zod.dev/)

