import { PaginationSchema } from 'src/shared/classes/pagination.dto';
import { z } from 'zod';

export const QueryPostSchema = PaginationSchema.extend({
  title: z.string().optional(),
  tagName: z.string().optional(),
});

export type QueryPostDto = z.infer<typeof QueryPostSchema>;
