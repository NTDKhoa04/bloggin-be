import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePostTagDto } from './dto/create-post-tag.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Post_Tag } from '../post-tag/model/post-tag.model';
import { Post } from 'src/post/model/post.model';
import { Tag } from 'src/tag/model/tag.model';
import { SuccessResponse } from 'src/shared/classes/success-response.class';

@Injectable()
export class PostTagService {
  constructor(
    @InjectModel(Post_Tag) private postTagModel: typeof Post_Tag,
    @InjectModel(Post) private postModel: typeof Post,
    @InjectModel(Tag) private tagModel: typeof Tag,
  ) {}

  async create(createPostTagDto: CreatePostTagDto) {
    const { postId, tagId } = createPostTagDto;

    const existingPostTag = await this.postTagModel.findOne({
      where: { postId, tagId },
    });

    const post = await this.postModel.findByPk(createPostTagDto.postId);
    const tag = await this.tagModel.findByPk(createPostTagDto.tagId);
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    if (!tag) {
      throw new NotFoundException('Tag not found');
    }
    if (existingPostTag) {
      throw new ConflictException('PostTag already exists');
    }

    const postTag = await this.postTagModel.create(createPostTagDto);

    return new SuccessResponse<Post_Tag>(
      'PostTag created successfully',
      postTag,
    );
  }

  async findAllTagsByPostId(postId: string): Promise<SuccessResponse<Tag[]>> {
    const post = await this.postModel.findByPk(postId, {
      include: [
        {
          model: Tag,
          through: { attributes: [] },
        },
      ],
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return new SuccessResponse<Tag[]>('Post Tags found', post.tags);
  }

  async remove(createPostTagDto: CreatePostTagDto) {
    const { postId, tagId } = createPostTagDto;

    const postTag = await this.postTagModel.findOne({
      where: { postId, tagId },
    });

    if (!postTag) {
      throw new NotFoundException('PostTag not found');
    }

    await postTag.destroy();

    return new SuccessResponse('PostTag deleted successfully', undefined);
  }

  async findAllPostsByTagId(tagId: string): Promise<SuccessResponse<Post[]>> {
    const tag = await this.tagModel.findByPk(tagId, {
      include: [
        {
          model: Post,
          through: { attributes: [] },
          include: [
            {
              model: Tag,
              through: { attributes: [] },
            },
          ],
        },
      ],
    });

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    return new SuccessResponse<Post[]>('Posts found', tag.posts);
  }
}
