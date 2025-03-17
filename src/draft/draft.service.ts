import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Draft } from './model/draft.model';
import { CreateDraftDto } from './dto/create-draft.dto';
import { UpdateDraftDto } from './dto/update-draft.dto';
import { SuccessResponse } from 'src/shared/classes/success-response.class';
import { User } from 'src/user/model/user.model';

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

  async findByAuthor(authorId: string) {
    const author = await this.userModel.findByPk(authorId);

    if (!author) {
      throw new NotFoundException(`Author with id ${authorId} not found`);
    }

    const drafts = await this.DraftModel.findAll({
      where: { authorId },
    });

    return new SuccessResponse<Draft[]>('Draft Found', drafts);
  }

  async findOne(id: string) {
    const draft = await this.DraftModel.findByPk(id);

    if (!draft) {
      throw new NotFoundException(`Draft with id ${id} not found`);
    }

    return new SuccessResponse<Draft>('Draft Found', draft);
  }

  async update(id: string, updateDraftDto: UpdateDraftDto) {
    const draft = await this.DraftModel.findByPk(id);

    if (!draft) {
      throw new NotFoundException(`Draft with id ${id} not found`);
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
