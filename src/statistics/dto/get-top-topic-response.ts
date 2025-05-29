import { z } from 'zod';

export const GetTopTopicResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  postCount: z.number().int().nonnegative(),
});

export type GetTopTopicResponseDto = z.infer<typeof GetTopTopicResponseSchema>;
