import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { LoggedInOnly } from 'src/auth/guards/authenticated.guard';
import {
  PaginationDto,
  PaginationSchema,
} from 'src/shared/classes/pagination.dto';
import { OwnerCheck } from 'src/shared/decorators/owner.decorator';
import { ZodValidationPipe } from 'src/shared/pipes/zod.pipe';
import { CommentService } from './comment.service';
import {
  CreateCommentDto,
  CreateCommentSchema,
} from './dto/create-comment.dto';
import {
  UpdateCommentDto,
  UpdateCommentSchema,
} from './dto/update-comment.dto';
import { User } from 'src/user/model/user.model';
import { Me } from 'src/shared/decorators/user.decorator';

@Controller({ path: 'comment', version: '1' })
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @UseGuards(LoggedInOnly)
  @Post()
  create(
    @Body(new ZodValidationPipe(CreateCommentSchema))
    createCommentDto: CreateCommentDto,
    @Me() user: Partial<User>,
  ) {
    const { id: userId } = user;
    return this.commentService.create(createCommentDto, userId ?? '');
  }

  @Get('post/:postId')
  findAllCommentByPostId(
    @Param('postId') postId: string,
    @Query(new ZodValidationPipe(PaginationSchema)) pagination: PaginationDto,
  ) {
    return this.commentService.findAllCommentByPostId(postId, pagination);
  }

  @UseGuards(LoggedInOnly)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateCommentSchema))
    updateCommentDto: UpdateCommentDto,
    @Me() user: Partial<User>,
  ) {
    const { id: userId } = user;

    return this.commentService.update(id, updateCommentDto, userId ?? '');
  }

  @UseGuards(LoggedInOnly)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.commentService.remove(id);
  }
}
