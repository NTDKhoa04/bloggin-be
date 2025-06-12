import { PaginationSchema } from 'src/shared/classes/pagination.dto';
import { z } from 'zod';

export const QueryUserSchema = PaginationSchema.extend({
  username: z.string().min(1).max(255),
  email: z.string().email(),
  displayName: z.string().min(1).max(255),
  tag: z.string().min(1).max(255).optional(),
});

export type QueryUserDto = z.infer<typeof QueryUserSchema>;
