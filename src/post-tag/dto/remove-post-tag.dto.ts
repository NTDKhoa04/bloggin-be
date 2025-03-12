import { z } from 'zod';
import { CreatePostTagSchema } from 'src/post-tag/dto/create-post-tag.dto';

export type RemovePostTagDto = z.infer<typeof CreatePostTagSchema>;
