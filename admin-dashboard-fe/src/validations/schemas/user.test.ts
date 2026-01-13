import { describe, it, expect } from 'vitest';
import {
  userFiltersSchema,
  createUserSchema,
  updateUserSchema,
} from '@/validations/schemas/user';

describe('User Validation Schemas', () => {
  describe('userFiltersSchema', () => {
    it('should validate valid filter data', () => {
      const validData = {
        search: 'john',
        per_page: 10,
        sort_by: 'created_at',
        sort_order: 'desc',
      };
      const result = userFiltersSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should use default values when not provided', () => {
      const validData = {};
      const result = userFiltersSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.per_page).toBe(10);
        expect(result.data.sort_by).toBe('created_at');
        expect(result.data.sort_order).toBe('desc');
      }
    });

    it('should reject per_page greater than 100', () => {
      const invalidData = {
        per_page: 150,
      };
      const result = userFiltersSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject negative per_page', () => {
      const invalidData = {
        per_page: -1,
      };
      const result = userFiltersSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid sort_order', () => {
      const invalidData = {
        sort_order: 'invalid',
      };
      const result = userFiltersSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('createUserSchema', () => {
    it('should validate valid create user data', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        password_confirmation: 'password123',
        role: 'admin' as const,
      };
      const result = createUserSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject mismatched passwords', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        password_confirmation: 'differentpassword',
        role: 'merchant' as const,
      };
      const result = createUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject password less than 6 characters', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: '12345',
        password_confirmation: '12345',
        role: 'admin' as const,
      };
      const result = createUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject name less than 2 characters', () => {
      const invalidData = {
        name: 'J',
        email: 'john@example.com',
        password: 'password123',
        password_confirmation: 'password123',
        role: 'admin' as const,
      };
      const result = createUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid role', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        password_confirmation: 'password123',
        role: 'super_admin' as const,
      };
      const result = createUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject empty email', () => {
      const invalidData = {
        name: 'John Doe',
        email: '',
        password: 'password123',
        password_confirmation: 'password123',
        role: 'admin' as const,
      };
      const result = createUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject empty password', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: '',
        password_confirmation: 'password123',
        role: 'admin' as const,
      };
      const result = createUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('updateUserSchema', () => {
    it('should validate valid update data with all fields', () => {
      const validData = {
        name: 'John Updated',
        email: 'john.updated@example.com',
        password: 'newpassword123',
        password_confirmation: 'newpassword123',
        role: 'merchant' as const,
      };
      const result = updateUserSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate valid update data with partial fields', () => {
      const validData = {
        name: 'John Updated',
      };
      const result = updateUserSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate empty object', () => {
      const validData = {};
      const result = updateUserSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject password without confirmation', () => {
      const invalidData = {
        password: 'newpassword123',
      };
      const result = updateUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject mismatched passwords', () => {
      const invalidData = {
        password: 'newpassword123',
        password_confirmation: 'differentpassword',
      };
      const result = updateUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid email format', () => {
      const invalidData = {
        email: 'invalid-email',
      };
      const result = updateUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid role', () => {
      const invalidData = {
        role: 'super_admin' as const,
      };
      const result = updateUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject password less than 6 characters', () => {
      const invalidData = {
        password: '12345',
        password_confirmation: '12345',
      };
      const result = updateUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});

