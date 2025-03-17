import { z } from 'zod';

export const PaginationSchema = z.object({
  page: z.number().int().positive().default(1).optional(),
  limit: z.number().int().positive().default(10).optional(),
});

export type PaginationDto = z.infer<typeof PaginationSchema>;
