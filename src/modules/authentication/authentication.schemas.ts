import { z } from 'zod';

const emailSchema = z.string().email('Invalid email address');
const passwordSchema = z.string().min(8, 'Password must be at least 8 characters long');

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: passwordSchema,
});

export const resetPasswordSchema = z.object({
  newPassword: passwordSchema,
});

/* export const editUserSchema = z
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
  ); */

export const editUserSchema = z
  .object({
    userFieldName: z.enum(['email', 'password']),
  })
  .and(
    z.discriminatedUnion('userFieldName', [
      z.object({
        userFieldName: z.literal('email'),
        userFieldValue: emailSchema,
      }),
      z.object({
        userFieldName: z.literal('password'),
        userFieldValue: passwordSchema,
        currentPassword: passwordSchema,
      }),
    ]),
  );

export type RegisterSchema = z.infer<typeof registerSchema>;
export type LoginSchema = z.infer<typeof loginSchema>;
export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;
export type EditUserSchema = z.infer<typeof editUserSchema>;
