import { z } from 'zod';

export const UpdatePostSchema = z.object({
  authorId: z.string().optional(),
  title: z.string().optional(),
  content: z.string().optional(),
});

export type UpdatePostDto = z.infer<typeof UpdatePostSchema>;
