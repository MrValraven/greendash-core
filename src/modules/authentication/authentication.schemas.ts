import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});

export const resetPasswordSchema = z.object({
  newPassword: z.string().min(8, 'Password must be at least 8 characters long'),
});

export const editUserSchema = z
  .object({
    field: z.enum(['email', 'password']),
    value: z.string(),
    currentPassword: z.string().min(8, 'Current password is required'),
  })
  .refine(
    (data) => {
      switch (data.field) {
        case 'email':
          return z.string().email().safeParse(data.value).success;
        case 'password':
          return data.value.length >= 8;
        default:
          return false;
      }
    },
    {
      message: 'Invalid value for selected field',
    },
  );

export type RegisterSchema = z.infer<typeof registerSchema>;
export type LoginSchema = z.infer<typeof loginSchema>;
export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;
export type EditUserSchema = z.infer<typeof editUserSchema>;
