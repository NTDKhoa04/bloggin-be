import { PostStatus } from 'src/shared/enum/post-status.enum';
import { z } from 'zod';

export const GetPostByMonitoringStatusSchema = z.object({
  status: z.nativeEnum(PostStatus),
});

export type GetPostByMonitoringStatusDto = z.infer<
  typeof GetPostByMonitoringStatusSchema
>;
