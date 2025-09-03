import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string(),
  email: z.email(),
  emailVisibility: z.boolean(),
  verified: z.boolean(),
  avatar: z.string().optional(),
  created: z
    .string()
    .transform(str => str.replace(' ', 'T'))
    .pipe(z.iso.datetime()),
  updated: z
    .string()
    .transform(str => str.replace(' ', 'T'))
    .pipe(z.iso.datetime()),
});

export const LoginUserSchema = z.object({
  email: UserSchema.shape.email,
  password: z.string().min(1, 'Password is required'),
});

export const SignupUserSchema = z
  .object({
    email: UserSchema.shape.email,
    emailVisibility: UserSchema.shape.emailVisibility,
    password: z.string().min(8, 'Password must be at least 8 characters'),
    passwordConfirm: z
      .string()
      .min(8, 'Password must be at least 8 characters'),
  })
  .refine(data => data.password === data.passwordConfirm, {
    path: ['passwordConfirm'],
    message: 'Passwords do not match',
  });

export type User = z.infer<typeof UserSchema>;
export type LoginUser = z.infer<typeof LoginUserSchema>;
export type SignupUser = z.infer<typeof SignupUserSchema>;
