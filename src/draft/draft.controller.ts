import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { LoggedInOnly } from 'src/auth/guards/authenticated.guard';
import {
  PaginationDto,
  PaginationSchema,
} from 'src/shared/classes/pagination.dto';
import { Me } from 'src/shared/decorators/user.decorator';
import { ZodValidationPipe } from 'src/shared/pipes/zod.pipe';
import { User } from 'src/user/model/user.model';
import { DraftService } from './draft.service';
import { CreateDraftDto, CreateDraftSchema } from './dto/create-draft.dto';
import { UpdateDraftDto, UpdateDraftSchema } from './dto/update-draft.dto';
import { SaveYjsContentDto } from './dto/save-yjs-content.dto';
import { CollaboratorService, DraftPermission } from 'src/collaborator/collaborator.service';
import { SuccessResponse } from 'src/shared/classes/success-response.class';

@UseGuards(LoggedInOnly)
@Controller({ path: 'draft', version: '1' })
export class DraftController {
  constructor(
    private readonly draftService: DraftService,
    private readonly collaboratorService: CollaboratorService,
  ) { }

  @Post()
  async createDraft(
    @Body(new ZodValidationPipe(CreateDraftSchema))
    createDraftDto: CreateDraftDto,
  ) {
    return this.draftService.create(createDraftDto);
  }

  @Put('/:id')
  async updatePost(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateDraftSchema))
    updateDraftDto: UpdateDraftDto,
    @Me() user: Partial<User>,
  ) {
    const { id: userId, ...userWithoutId } = user;
    return this.draftService.update(id, updateDraftDto, userId ?? '');
  }

  @Get('/author')
  async getDraftsByAuthor(
    @Me() user: Partial<User>,
    @Query(new ZodValidationPipe(PaginationSchema)) pagination: PaginationDto,
  ) {
    const { id, ...userWithoutId } = user;
    return this.draftService.findByAuthor(id ? id : '', pagination);
  }

  @Get('/collaborated')
  async getCollaboratedDrafts(
    @Me() user: Partial<User>,
    @Query(new ZodValidationPipe(PaginationSchema)) pagination: PaginationDto,
  ) {
    const { id } = user;
    return this.draftService.findCollaboratedDrafts(id ? id : '', pagination);
  }

  @Get('/:id')
  async getPostById(@Param('id') id: string) {
    return this.draftService.findOne(id);
  }

  @Delete('/:id')
  async deletePost(@Param('id') id: string, @Me() user: Partial<User>) {
    const { id: userId } = user;
    return this.draftService.remove(id, userId ?? '');
  }

  @Get('/:draftId/content')
  async getYjsContent(
    @Param('draftId') draftId: string,
    @Me() user: Partial<User>,
  ) {
    // Check if user has read permission
    const hasPermission = await this.collaboratorService.checkPermission(
      draftId,
      user.id!,
      DraftPermission.READ,
    );

    // Also check if user is the owner
    const draftResponse = await this.draftService.findOne(draftId);
    const draft = draftResponse.data!;

    if (!hasPermission && draft.authorId !== user.id) {
      throw new ForbiddenException(
        'You do not have permission to access this content',
      );
    }

    return {
      draftId: draft.id,
      yjsContent: draft.yjsContent || '',
    };
  }

  @Put('/:draftId/content')
  async saveYjsContent(
    @Param('draftId') draftId: string,
    @Body() dto: SaveYjsContentDto,
    @Me() user: Partial<User>,
  ) {
    // Check if user has write permission
    const hasPermission = await this.collaboratorService.checkPermission(
      draftId,
      user.id!,
      DraftPermission.WRITE,
    );

    // Also check if user is the owner
    const draftResponse = await this.draftService.findOne(draftId);
    const draft = draftResponse.data!;

    const isOwner = draft.authorId === user.id;
    if (!hasPermission && !isOwner) {
      throw new ForbiddenException(
        'You do not have permission to edit this content',
      );
    }

    await this.draftService.saveYjsContent(draftId, dto.content);

    return new SuccessResponse('Content saved successfully', {
      draftId,
      yjsContent: dto.content,
    });
  }
}
