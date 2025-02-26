import { z } from 'zod';

export const ChangePasswordSchema = z.object({
  oldPassword: z.string().min(8),
  newPassword: z.string().min(8),
});

export type ChangePasswordDto = z.infer<typeof ChangePasswordSchema>;
