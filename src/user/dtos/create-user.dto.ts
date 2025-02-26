import { z } from 'zod';

export const CreateUserSchema = z.object({
  username: z.string().min(1).max(255),
  password: z.string().min(8).max(16),
  displayName: z.string().min(1).max(255),
  email: z.string().email(),
});

export type CreateUserDto = z.infer<typeof CreateUserSchema>;
