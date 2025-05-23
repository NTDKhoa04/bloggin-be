import { spec } from 'node:test/reporters';
import { LoginMethodEmun } from 'src/shared/enum/login-method.enum';
import { z } from 'zod';

export const CreateUserSchema = z.object({
  username: z.string().min(1).max(255),
  password: z.string().min(8).max(16),
  displayName: z.string().min(1).max(255),
  email: z.string().email(),
  avatarUrl: z.string().optional(),
  isVerified: z.boolean().optional(),
  loginMethod: z.nativeEnum(LoginMethodEmun).optional(),
  specialties: z.string().optional(),
  about: z.string().optional(),
});

export type CreateUserDto = z.infer<typeof CreateUserSchema>;

export const CreateLocalUserSchema = CreateUserSchema.refine(
  (data) => !!data.password,
  {
    message: 'Password is required for local authentication',
    path: ['password'],
  },
);
export type CreateLocalUserDto = z.infer<typeof CreateLocalUserSchema>;

export const CreateGoogleUserSchema = CreateUserSchema.omit({
  password: true,
});
export type CreateGoogleUserDto = z.infer<typeof CreateGoogleUserSchema>;
