import { z } from 'zod';

export const CreatePostSchema = z.object({
  authorId: z.string().nonempty({ message: 'authorId is required' }),
  title: z.string().max(255).nonempty({ message: 'title is required' }),
  content: z.string().nonempty({ message: 'content is required' }),
});

export type CreatePostDto = z.infer<typeof CreatePostSchema>;
