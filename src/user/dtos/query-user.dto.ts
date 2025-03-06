import { z } from 'zod';

export const QueryUserSchema = z.object({
  username: z.string().min(1).max(255),
  email: z.string().email(),
  displayName: z.string().min(1).max(255),
});

export type QueryUserDto = z.infer<typeof QueryUserSchema>;
