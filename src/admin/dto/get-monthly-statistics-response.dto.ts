import { z } from 'zod';

export const GetMonthlyStatisticsResponseSchema = z.object({
  date: z.date(),
  count: z.number(),
});

export type GetMonthlyStatisticsResponseDto = z.infer<
  typeof GetMonthlyStatisticsResponseSchema
>;
