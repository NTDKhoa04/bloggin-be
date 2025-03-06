import { z } from 'zod';

export const LoginSchema = z.object({
  username: z.string().min(1).max(255),
  password: z.string().min(8).max(16),
});

export type LoginDto = z.infer<typeof LoginSchema>;
