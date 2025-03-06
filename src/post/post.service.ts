import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Post } from './model/post.model';
import { CreatePostDto } from './dtos/createPostDto.dto';
import { UpdatePostDto } from './dtos/updatePostDto.dto';
import { ValidationError } from 'src/shared/classes/validation-error.class';

@Injectable()
export class PostService {
  constructor(@InjectModel(Post) private postModel: typeof Post) {}

  async create(createPostDto: CreatePostDto): Promise<Post> {
    const post = this.postModel.create(createPostDto);
    return post;
  }

  async findAll() {
    const posts = await this.postModel.findAll();
    return posts;
  }

  async findOne(id: string) {
    const post = await this.postModel.findByPk(id);
    return post;
  }

  async update(id: string, updatePostDto: UpdatePostDto) {
    const post = await this.postModel.findByPk(id);

    if (post) {
      await post.update({ ...updatePostDto });
      await post.save();
    }

    return post;
  }

  async remove(id: string) {
    const post = await this.postModel.findByPk(id);
    if (post) {
      await post.destroy();
    }
    return `This action removes a #${id} post`;
  }
}
