import { z } from 'zod';

export const CreateTagSchema = z.object({
  name: z.string().max(50).nonempty({ message: 'name is required' }),
});

export type CreateTagDto = z.infer<typeof CreateTagSchema>;
