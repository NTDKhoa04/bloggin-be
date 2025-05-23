import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Post } from './model/post.model';
import { CreatePostDto } from './dtos/create-post.dto';
import { UpdatePostDto } from './dtos/update-post.dto';
import {
  PaginationWrapper,
  SuccessResponse,
} from 'src/shared/classes/success-response.class';
import { Tag } from 'src/tag/model/tag.model';
import { Sequelize } from 'sequelize-typescript';
import { User } from 'src/user/model/user.model';
import { PaginationDto } from 'src/shared/classes/pagination.dto';
import { Comment } from 'src/comment/model/comment.model';
import { Follow } from 'src/follow/model/follow.model';
import extractTextFromPostContent from 'src/shared/utils/extractTextFromPostContent';
import { TtsService } from 'src/tts/tts.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import extractAudioCloudinaryPublicId from 'src/shared/utils/extractAudioPublicIdFromUrl';
import generateSafeSSML from 'src/shared/utils/generateSafeSSML';

export const USER_ATTRIBUTES = [
  'username',
  'displayName',
  'avatarUrl',
  'isAdmin',
  'email',
];

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post) private postModel: typeof Post,
    @InjectModel(User) private userModel: typeof User,
    @InjectModel(Follow) private followModel: typeof Follow,
    @InjectModel(Tag) private tagModel: typeof Tag,
    @InjectModel(Comment) private commentModel: typeof Comment,
    private sequelize: Sequelize,
    private readonly ttsService: TtsService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(createPostDto: CreatePostDto) {
    const transaction = await this.sequelize.transaction();

    try {
      const { authorId, title, content, tags } = createPostDto;

      const user = await this.userModel.findByPk(authorId);

      if (!user) {
        throw new NotFoundException(`User with id ${authorId} not found`);
      }

      // Create post
      const post = await this.postModel.create(
        { authorId, title, content },
        { transaction },
      );

      if (!post) {
        throw new Error('Failed to create post.');
      }

      //remove the duplicate tags
      const uniqueTags = Array.from(new Set(tags));

      // Find existing tags
      const existingTags = await Tag.findAll({
        where: { name: uniqueTags },
        transaction,
      });

      // Find non-existing tags name
      const existingTagNames = new Set(existingTags.map((tag) => tag.name));
      const nonExistingTagsName = tags.filter(
        (tagName) => !existingTagNames.has(tagName),
      );

      // Create new tags
      const newTags = await Tag.bulkCreate(
        nonExistingTagsName.map((name) => ({ name })),
        { transaction, returning: true },
      );

      // Add tags together
      const allTags = [...existingTags, ...newTags];

      await post.$add('tags', allTags, {
        transaction,
      });

      await this.postModel.findByPk(post.id, { include: Tag, transaction });

      await transaction.commit();

      return new SuccessResponse<Post>('Create post successfully', post);
    } catch (error) {
      await transaction.rollback();
      throw new Error('Failed to create post: ' + error.message);
    }
  }

  //implement pagination with cursor based pagination
  async findAll(pagination: PaginationDto) {
    const offset = (pagination.page - 1) * pagination.limit;

    const { rows: posts, count } = await this.postModel.findAndCountAll({
      include: [
        {
          model: User,
          attributes: USER_ATTRIBUTES,
        },
        {
          model: Tag,
          through: { attributes: [] },
        },
      ],
      attributes: {
        include: [
          [
            Sequelize.literal(
              `(SELECT COUNT(*) FROM "Comments" WHERE "Comments"."postId" = "Post"."id")`,
            ),
            'commentCount',
          ],
        ],
      },
      limit: pagination.limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return new PaginationWrapper<Post[]>(
      'Posts found',
      posts,
      count,
      pagination.page,
      pagination.limit,
    );
  }

  async findOne(id: string) {
    const post = await this.postModel.findByPk(id, {
      include: [
        {
          model: User,
          attributes: USER_ATTRIBUTES,
        },
        {
          model: Tag,
          through: { attributes: [] },
        },
      ],
      attributes: {
        include: [
          [
            Sequelize.literal(
              `(SELECT COUNT(*) FROM "Comments" WHERE "Comments"."postId" = "Post"."id")`,
            ),
            'commentCount',
          ],
        ],
      },
    });

    if (!post) {
      throw new NotFoundException(`Post with id ${id} not found`);
    }

    return new SuccessResponse<Post>('Post Found', post);
  }

  async findByAuthor(authorId: string, pagination: PaginationDto) {
    const offset = (pagination.page - 1) * pagination.limit;

    const author = await this.userModel.findByPk(authorId);

    if (!author) {
      throw new NotFoundException(`Author with id ${authorId} not found`);
    }

    const { rows: posts, count } = await this.postModel.findAndCountAll({
      where: { authorId },
      include: [
        {
          model: User,
          attributes: USER_ATTRIBUTES,
        },
        {
          model: Tag,
          through: { attributes: [] },
        },
      ],
      limit: pagination.limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return new PaginationWrapper<Post[]>(
      'Post Found',
      posts,
      count,
      pagination.page,
      pagination.limit,
    );
  }

  async getFollowingPost(userId: string, pagination: PaginationDto) {
    //find the author that the user is following
    const data = await this.followModel.findAll({
      where: { followerId: userId },
    });
    const followings: Follow[] = data.map((follow) => {
      return follow.dataValues;
    });

    let resultPosts: Post[];
    followings.forEach(async (following, index) => {
      const post = await this.postModel.findAll({
        where: { authorId: following.authorId },
      });
      console.log(`post on ${index} itteration: `, post);
    });
  }

  async update(id: string, updatePostDto: UpdatePostDto, authorId: string) {
    if (updatePostDto.authorId !== authorId) {
      throw new ForbiddenException('You are not allowed to update this post');
    }

    const post = await this.postModel.findByPk(id, {
      include: [
        {
          model: User,
          attributes: USER_ATTRIBUTES,
        },
        {
          model: Tag,
          through: { attributes: [] },
        },
      ],
    });

    if (!post) {
      throw new NotFoundException(`Post with id ${id} not found`);
    }

    await post.update({ ...updatePostDto });
    await this.deleteAudioResource(post);
    await post.save();

    return new SuccessResponse<Post>('Post updated successfully', post);
  }

  async remove(id: string) {
    const post = await this.postModel.findByPk(id);
    if (!post) {
      throw new NotFoundException(`Post with id ${id} not found`);
    }

    await this.deleteAudioResource(post);

    await post.destroy();

    return new SuccessResponse<Post>('Post deleted successfully', undefined);
  }

  async synthesizePostById(postId: string, language: string) {
    const post = await this.postModel.findByPk(postId);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const audioExist = await this.checkIfAudioExists(post, language);

    if (audioExist) {
      return new SuccessResponse<string>(
        'Audio exists',
        language === 'en' ? post.enVoiceUrl : post.viVoiceUrl,
      );
    }

    const extractContent = extractTextFromPostContent(
      JSON.parse(String(post.content ?? '')),
    );

    const content = generateSafeSSML(extractContent);
    console.log('Content:', content);
    const audioUrl = await this.ttsService.synthesizeTextToFile(
      content,
      language,
    );

    if (language === 'en') {
      post.enVoiceUrl = audioUrl;
    } else if (language === 'vn') {
      post.viVoiceUrl = audioUrl;
    }

    await post.save();

    return new SuccessResponse<String>('Synthesize completed', audioUrl);
  }

  async checkIfAudioExists(post: Post, language: string) {
    if (language === 'en') {
      return !!post.enVoiceUrl;
    } else if (language === 'vn') {
      return !!post.viVoiceUrl;
    } else {
      return false;
    }
  }

  async deleteAudioResource(post: Post) {
    if (post.enVoiceUrl) {
      const publicId = extractAudioCloudinaryPublicId(post.enVoiceUrl);
      if (publicId) {
        const result =
          await this.cloudinaryService.removeAudioResourceByPublicId(publicId);

        console.log('Audio en removed from Cloudinary:', result);
      }
    }

    if (post.viVoiceUrl) {
      const publicId = extractAudioCloudinaryPublicId(post.viVoiceUrl);
      if (publicId) {
        const result =
          await this.cloudinaryService.removeAudioResourceByPublicId(publicId);

        console.log('Audio vi removed from Cloudinary:', result);
      }
    }
  }
}
