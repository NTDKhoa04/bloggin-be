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
import { CollaboratorService, DraftPermission } from 'src/collaborator/collaborator.service';
import { Collaborator } from 'src/collaborator/model/collaborator.model';

@Injectable()
export class DraftService {
  constructor(
    @InjectModel(Draft) private DraftModel: typeof Draft,
    @InjectModel(User) private userModel: typeof User,
    private collaboratorService: CollaboratorService,
  ) { }

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

    // Check if user is owner or has write permission (editor)
    const hasPermission = await this.collaboratorService.checkPermission(
      id,
      authorId,
      DraftPermission.WRITE,
    );

    if (!hasPermission) {
      throw new ForbiddenException(`You are not allowed to update this draft`);
    }

    await draft.update({ ...updateDraftDto });
    await draft.save();

    return new SuccessResponse<Draft>('Draft updated successfully', draft);
  }

  async remove(id: string, userId: string) {
    const draft = await this.DraftModel.findByPk(id);
    if (!draft) {
      throw new NotFoundException(`Draft with id ${id} not found`);
    }

    // Check if user is owner or has write permission (editor)
    const hasPermission = await this.collaboratorService.checkPermission(
      id,
      userId,
      DraftPermission.WRITE,
    );

    if (!hasPermission) {
      throw new ForbiddenException(`You are not allowed to delete this draft`);
    }

    // Remove all collaborators first to satisfy foreign key constraints
    await this.collaboratorService.removeAllCollaborators(id);

    await draft.destroy();

    return new SuccessResponse<Draft>('Draft deleted successfully', undefined);
  }

  async saveYjsContent(draftId: string, yjsContent: string): Promise<void> {
    const draft = await this.DraftModel.findByPk(draftId);

    if (!draft) {
      throw new NotFoundException(`Draft with id ${draftId} not found`);
    }

    draft.yjsContent = yjsContent;
    await draft.save();
  }

  async findCollaboratedDrafts(userId: string, pagination: PaginationDto) {
    const offset = (pagination.page - 1) * pagination.limit;

    const { rows: drafts, count } = await this.DraftModel.findAndCountAll({
      include: [
        {
          model: Collaborator,
          where: { userId },
          required: true,
          attributes: [],
        },
      ],
      offset,
      limit: pagination.limit,
      order: [['updatedAt', 'DESC']],
    });

    return new PaginationWrapper<Draft[]>(
      'Collaborated Drafts Found',
      drafts,
      count,
      pagination.page ?? 1,
      pagination.limit ?? 10,
    );
  }
}

