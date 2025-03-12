import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Post } from './model/post.model';
import { CreatePostDto } from './dtos/create-post.dto';
import { UpdatePostDto } from './dtos/update-post.dto';
import { SuccessResponse } from 'src/shared/classes/success-response.class';
import { Tag } from 'src/tag/model/tag.model';

@Injectable()
export class PostService {
  constructor(@InjectModel(Post) private postModel: typeof Post) {}

  async create(createPostDto: CreatePostDto): Promise<Post> {
    const post = this.postModel.create(createPostDto);
    return post;
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
