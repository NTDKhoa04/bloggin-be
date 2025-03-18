import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
} from '@nestjs/common';
import { DraftService } from './draft.service';
import { CreateDraftDto, CreateDraftSchema } from './dto/create-draft.dto';
import { UpdateDraftDto, UpdateDraftSchema } from './dto/update-draft.dto';
import { ZodValidationPipe } from 'src/shared/pipes/zod.pipe';
import {
  PaginationDto,
  PaginationSchema,
} from 'src/shared/classes/pagination.dto';
import { Me } from 'src/shared/decorators/user.decorator';
import { User } from 'src/user/model/user.model';

@Controller({ path: 'draft', version: '1' })
export class DraftController {
  constructor(private readonly draftService: DraftService) {}

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

  @Get('/:id')
  async getPostById(@Param('id') id: string) {
    return this.draftService.findOne(id);
  }

  @Delete('/:id')
  async deletePost(@Param('id') id: string) {
    return this.draftService.remove(id);
  }
}
