import { z } from 'zod';

export const CreatePostTagSchema = z.object({
  postId: z.string().nonempty('Post ID is required'),
  tagId: z.string().nonempty('Tag ID is required'),
});

export type CreatePostTagDto = z.infer<typeof CreatePostTagSchema>;
