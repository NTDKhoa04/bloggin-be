import { z } from 'zod';

export const UpdateDraftSchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
});

export type UpdateDraftDto = z.infer<typeof UpdateDraftSchema>;
