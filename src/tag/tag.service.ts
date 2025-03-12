import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTagDto } from './dto/create-tag.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Tag } from './model/tag.model';
import { SuccessResponse } from 'src/shared/classes/success-response.class';

@Injectable()
export class TagService {
  constructor(@InjectModel(Tag) private tagModel: typeof Tag) {}

  async create(createTagDto: CreateTagDto) {
    const post = await this.tagModel.create(createTagDto);

    return new SuccessResponse<Tag>('Tag created successfully', post);
  }

  async findAll() {
    const tags = await this.tagModel.findAll();

    return new SuccessResponse<Tag[]>('Tags found', tags);
  }

  async findOne(id: string) {
    const tag = await this.tagModel.findByPk(id);

    if (!tag) {
      throw new NotFoundException(`Tag with id ${id} not found`);
    }

    return new SuccessResponse<Tag>('Tag found', tag);
  }

  async remove(id: string) {
    const post = await this.tagModel.findByPk(id);

    if (!post) {
      throw new NotFoundException(`Tag with id ${id} not found`);
    }

    await post.destroy();

    return new SuccessResponse<Tag>('Tag deleted successfully', undefined);
  }
}
