import { z } from 'zod';

export const SepayCallbackBodySchema = z.object({
  id: z.number(),
  gateway: z.string(),
  transactionDate: z.string(),
  accountNumber: z.string(),
  code: z.string().nullable(),
  content: z.string(),
  transferType: z.string(),
  transferAmount: z.number(),
  accumulated: z.number(),
  subAccount: z.string().nullable(),
  referenceCode: z.string(),
  description: z.string(),
});

export type SepayCallbackBodyDto = z.infer<typeof SepayCallbackBodySchema>;
