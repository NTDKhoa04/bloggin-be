import { Post } from 'src/post/model/post.model';
import { Tag } from 'src/tag/model/tag.model';
import { User } from 'src/user/model/user.model';

export interface SearchResponseDto {
  Posts?: Post[];
  Authors?: User[];
  Tags?: Tag[];
}
