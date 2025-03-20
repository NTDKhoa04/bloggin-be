import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Draft } from './model/draft.model';
import { CreateDraftDto } from './dto/create-draft.dto';
import { UpdateDraftDto } from './dto/update-draft.dto';
import {
  PaginationWrapper,
  SuccessResponse,
} from 'src/shared/classes/success-response.class';
import { User } from 'src/user/model/user.model';
import { PaginationDto } from 'src/shared/classes/pagination.dto';

@Injectable()
export class DraftService {
  constructor(
    @InjectModel(Draft) private DraftModel: typeof Draft,
    @InjectModel(User) private userModel: typeof User,
  ) {}

  async create(createDraftDto: CreateDraftDto) {
    const draft = await this.DraftModel.create(createDraftDto);
    return new SuccessResponse<Draft>('Draft Found', draft);
  }

  async findByAuthor(authorId: string, pagination: PaginationDto) {
    const offset = (pagination.page - 1) * pagination.limit;

    const author = await this.userModel.findByPk(authorId);

    if (!author) {
      throw new NotFoundException(`Author with id ${authorId} not found`);
    }

    const { rows: drafts, count } = await this.DraftModel.findAndCountAll({
      where: { authorId },
      offset,
      limit: pagination.limit,
      order: [['updatedAt', 'DESC']],
    });

    return new PaginationWrapper<Draft[]>(
      'Draft Found',
      drafts,
      count,
      pagination.page ?? 1,
      pagination.limit ?? 10,
    );
  }

  async findOne(id: string) {
    const draft = await this.DraftModel.findByPk(id);

    if (!draft) {
      throw new NotFoundException(`Draft with id ${id} not found`);
    }

    return new SuccessResponse<Draft>('Draft Found', draft);
  }

  async update(id: string, updateDraftDto: UpdateDraftDto, authorId: string) {
    const draft = await this.DraftModel.findByPk(id);

    if (!draft) {
      throw new NotFoundException(`Draft with id ${id} not found`);
    }

    if (draft.authorId !== authorId) {
      throw new ForbiddenException(`You are not allowed to update this draft`);
    }

    await draft.update({ ...updateDraftDto });
    await draft.save();

    return new SuccessResponse<Draft>('Draft updated successfully', draft);
  }

  async remove(id: string) {
    const draft = await this.DraftModel.findByPk(id);
    if (!draft) {
      throw new NotFoundException(`Draft with id ${id} not found`);
    }

    await draft.destroy();

    return new SuccessResponse<Draft>('Draft deleted successfully', undefined);
  }
}
