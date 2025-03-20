import { z } from 'zod';

export const CreateFavoriteSchema = z.object({
  postId: z.string().nonempty({ message: 'postId is required' }),
});

export type CreateFavoriteDto = z.infer<typeof CreateFavoriteSchema>;
