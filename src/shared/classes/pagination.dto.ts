import { z } from 'zod';

export const PaginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().default(10),
});

export type PaginationDto = z.infer<typeof PaginationSchema>;
