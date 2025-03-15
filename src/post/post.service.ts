import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Post } from './model/post.model';
import { CreatePostDto } from './dtos/create-post.dto';
import { UpdatePostDto } from './dtos/update-post.dto';
import { SuccessResponse } from 'src/shared/classes/success-response.class';
import { Tag } from 'src/tag/model/tag.model';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post) private postModel: typeof Post,
    private sequelize: Sequelize,
  ) {}

  async create(createPostDto: CreatePostDto) {
    const transaction = await this.sequelize.transaction();

    try {
      const { authorId, title, content, tags } = createPostDto;

      // Create post
      const post = await this.postModel.create(
        { authorId, title, content },
        { transaction },
      );

      if (!post) {
        throw new Error('Failed to create post.');
      }

      // Find existing tags
      const existingTags = await Tag.findAll({
        where: { name: tags },
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

  async findAll() {
    const posts = await this.postModel.findAll({
      include: {
        model: Tag,
        through: { attributes: [] },
      },
    });
    return posts;
  }

  async findOne(id: string) {
    const post = await this.postModel.findByPk(id, {
      include: {
        model: Tag,
        through: { attributes: [] },
      },
    });

    if (!post) {
      throw new NotFoundException(`Post with id ${id} not found`);
    }

    return new SuccessResponse<Post>('Post Found', post);
  }

  async update(id: string, updatePostDto: UpdatePostDto) {
    const post = await this.postModel.findByPk(id, {
      include: {
        model: Tag,
        through: { attributes: [] },
      },
    });

    if (!post) {
      throw new NotFoundException(`Post with id ${id} not found`);
    }

    await post.update({ ...updatePostDto });
    await post.save();

    return new SuccessResponse<Post>('Post updated successfully', post);
  }

  async remove(id: string) {
    const post = await this.postModel.findByPk(id);
    if (!post) {
      throw new NotFoundException(`Post with id ${id} not found`);
    }

    await post.destroy();

    return new SuccessResponse<Post>('Post deleted successfully', undefined);
  }
}
