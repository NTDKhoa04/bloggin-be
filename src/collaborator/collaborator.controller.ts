import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { CollaboratorService, DraftPermission } from './collaborator.service';
import { AddCollaboratorDto } from './dto/add-collaborator.dto';
import { UpdateCollaboratorDto } from './dto/update-collaborator.dto';
import { CollaboratorResponseDto } from './dto/collaborator-response.dto';
import { LoggedInOnly } from 'src/auth/guards/authenticated.guard';
import { Me } from 'src/shared/decorators/user.decorator';
import { Draft as DraftModel } from 'src/draft/model/draft.model';
import { InjectModel } from '@nestjs/sequelize';

@Controller({path: 'drafts/:draftId/collaborators', version: '1' })
@UseGuards(LoggedInOnly)
export class CollaboratorController {
  constructor(
    private readonly collaboratorService: CollaboratorService,
    @InjectModel(DraftModel)
    private draftModel: typeof DraftModel,
  ) {}

  @Get()
  async getCollaborators(
    @Param('draftId') draftId: string,
    @Me() user: any,
  ): Promise<CollaboratorResponseDto[]> {
    // Check if user has read permission
    const hasPermission = await this.collaboratorService.checkPermission(
      draftId,
      user.id,
      DraftPermission.READ,
    );

    // Also check if user is the owner
    const draft = await this.draftModel.findByPk(draftId);
    if (!draft) {
      throw new ForbiddenException('Draft not found');
    }

    if (!hasPermission && draft.authorId !== user.id) {
      throw new ForbiddenException(
        'You do not have permission to view collaborators',
      );
    }

    return this.collaboratorService.getCollaborators(draftId);
  }

  @Post()
  async addCollaborator(
    @Param('draftId') draftId: string,
    @Body() dto: AddCollaboratorDto,
    @Me() user: any,
  ): Promise<CollaboratorResponseDto> {
    // Only owner can add collaborators
    const draft = await this.draftModel.findByPk(draftId);
    if (!draft) {
      throw new ForbiddenException('Draft not found');
    }

    if (draft.authorId !== user.id) {
      throw new ForbiddenException('Only the owner can add collaborators');
    }

    return this.collaboratorService.addCollaborator(draftId, dto);
  }

  @Patch(':collabId')
  async updateCollaborator(
    @Param('draftId') draftId: string,
    @Param('collabId') collabId: string,
    @Body() dto: UpdateCollaboratorDto,
    @Me() user: any,
  ): Promise<CollaboratorResponseDto> {
    // Only owner can update collaborators
    const draft = await this.draftModel.findByPk(draftId);
    if (!draft) {
      throw new ForbiddenException('Draft not found');
    }

    if (draft.authorId !== user.id) {
      throw new ForbiddenException('Only the owner can update collaborators');
    }

    return this.collaboratorService.updateCollaborator(draftId, collabId, dto);
  }

  @Delete(':collabId')
  async removeCollaborator(
    @Param('draftId') draftId: string,
    @Param('collabId') collabId: string,
    @Me() user: any,
  ): Promise<{ message: string }> {
    // Only owner can remove collaborators
    const draft = await this.draftModel.findByPk(draftId);
    if (!draft) {
      throw new ForbiddenException('Draft not found');
    }

    if (draft.authorId !== user.id) {
      throw new ForbiddenException('Only the owner can remove collaborators');
    }

    await this.collaboratorService.removeCollaborator(draftId, collabId);
    return { message: 'Collaborator removed successfully' };
  }
}
