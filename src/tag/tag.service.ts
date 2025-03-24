import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTagDto } from './dto/create-tag.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Tag } from './model/tag.model';
import {
  PaginationWrapper,
  SuccessResponse,
} from 'src/shared/classes/success-response.class';
import { Op } from 'sequelize';
import { PaginationDto } from 'src/shared/classes/pagination.dto';

@Injectable()
export class TagService {
  constructor(@InjectModel(Tag) private tagModel: typeof Tag) {}

  async create(createTagDto: CreateTagDto) {
    const post = await this.tagModel.create(createTagDto);

    return new SuccessResponse<Tag>('Tag created successfully', post);
  }

  async findAll(pagination: PaginationDto, name?: string) {
    const offset = (pagination.page - 1) * pagination.limit;

    const { rows: tags, count } = await this.tagModel.findAndCountAll({
      where: name ? { name: { [Op.iLike]: `%${name}%` } } : undefined,
      offset,
      limit: pagination.limit,
    });

    return new PaginationWrapper<Tag[]>(
      'Tags found',
      tags,
      count,
      pagination.page,
      pagination.limit,
    );
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
