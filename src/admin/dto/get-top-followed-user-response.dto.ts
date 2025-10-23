import { spec } from 'node:test/reporters';
import { z } from 'zod';

export const GetTopFollowedUserResponseSchema = z.object({
  id: z.string(),
  username: z.string(),
  displayName: z.string(),
  specialties: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  followedCount: z.number().min(0),
});
export type GetTopFollowedUserResponseDto = z.infer<
  typeof GetTopFollowedUserResponseSchema
>;
