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
import { Sequelize } from 'sequelize-typescript';
import { Op } from 'sequelize';
import { USER_ATTRIBUTES } from 'src/post/post.service';
import { User } from 'src/user/model/user.model';

@Injectable()
export class PostTagService {
  constructor(
    @InjectModel(Post_Tag) private postTagModel: typeof Post_Tag,
    @InjectModel(Post) private postModel: typeof Post,
    @InjectModel(Tag) private tagModel: typeof Tag,
    private sequelize: Sequelize,
  ) {}

  async create(createPostTagDto: CreatePostTagDto) {
    const { postId, tagsId } = createPostTagDto;

    const post = await this.postModel.findByPk(createPostTagDto.postId);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const postTags: Post_Tag[] = [];

    const transaction = await this.sequelize.transaction();

    try {
      for (const tagId of tagsId) {
        const tag = await this.tagModel.findByPk(tagId, { transaction });

        if (!tag) {
          throw new NotFoundException('Tag not found');
        }

        const existingPostTag = await this.postTagModel.findOne({
          where: { postId, tagId },
          transaction,
        });

        if (existingPostTag) {
          throw new ConflictException('PostTag already exists');
        }

        const postTag = await this.postTagModel.create(
          { postId, tagId },
          { transaction },
        );

        postTags.push(postTag);
      }
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }

    return new SuccessResponse<Post_Tag[]>(
      'PostTag created successfully',
      postTags,
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

  async findAllTagsByPostIds(postIds: string[]): Promise<Tag[]> {
    const postTags = await this.postTagModel.findAll({
      where: {
        postId: {
          [Op.in]: postIds,
        },
      },
    });

    const tags = await this.tagModel.findAll({
      where: {
        id: {
          [Op.in]: postTags.map((pt) => pt.tagId),
        },
      },
    });

    return tags;
  }

  async remove(createPostTagDto: CreatePostTagDto) {
    const { postId, tagsId } = createPostTagDto;

    const transaction = await this.sequelize.transaction();

    try {
      for (const tagId of tagsId) {
        const postTag = await this.postTagModel.findOne({
          where: { postId, tagId },
          transaction,
        });

        if (!postTag) {
          throw new NotFoundException('PostTag not found');
        }

        await postTag.destroy({ transaction });
      }
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }

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

  async findAllPostsByTagIds(tagIds: string[]): Promise<Post[]> {
    const postTags = await this.postTagModel.findAll({
      where: {
        tagId: {
          [Op.in]: tagIds,
        },
      },
    });
    const postIds = postTags.map((pt) => pt.postId);

    const posts = this.postModel.findAll({
      where: {
        id: {
          [Op.in]: postIds,
        },
      },
      include: [
        {
          model: User,
          attributes: USER_ATTRIBUTES,
        },
      ],
      attributes: { exclude: ['content'] },
    });

    return posts;
  }
}
