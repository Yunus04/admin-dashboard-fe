// Zod Validation Schemas for User Management
import { z } from 'zod';

// User Filter Schema
export const userFiltersSchema = z.object({
  search: z.string().optional(),
  per_page: z.coerce.number().min(1).max(100).default(10),
  sort_by: z.string().default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
});

export type UserFiltersFormData = z.infer<typeof userFiltersSchema>;

// Create User Schema
export const createUserSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Name is required')
      .min(2, 'Name must be at least 2 characters'),
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Invalid email format'),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(6, 'Password must be at least 6 characters'),
    password_confirmation: z
      .string()
      .min(1, 'Password confirmation is required'),
    role: z.enum(['admin', 'merchant']),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
  });

export type CreateUserFormData = z.infer<typeof createUserSchema>;

// Update User Schema
export const updateUserSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .optional(),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format')
    .optional(),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .optional(),
  password_confirmation: z.string().optional(),
  role: z.enum(['admin', 'merchant']).optional(),
}).refine(
  (data) => {
    // If password is provided, password_confirmation must also be provided
    if (data.password && !data.password_confirmation) {
      return false;
    }
    // If both are provided, they must match
    if (data.password && data.password_confirmation) {
      return data.password === data.password_confirmation;
    }
    return true;
  },
  {
    message: 'Password confirmation is required',
    path: ['password_confirmation'],
  }
);

export type UpdateUserFormData = z.infer<typeof updateUserSchema>;

