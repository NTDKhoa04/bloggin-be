import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { PostTagService } from './post-tag.service';
import {
  CreatePostTagDto,
  CreatePostTagSchema,
} from './dto/create-post-tag.dto';
import { ZodValidationPipe } from 'src/shared/pipes/zod.pipe';
import { RemovePostTagDto } from './dto/remove-post-tag.dto';
import { LoggedInOnly } from 'src/auth/guards/authenticated.guard';

@Controller({ path: 'post-tag', version: '1' })
export class PostTagController {
  constructor(private readonly postTagService: PostTagService) {}

  @UseGuards(LoggedInOnly)
  @Post()
  async create(
    @Body(new ZodValidationPipe(CreatePostTagSchema))
    createPostTagDto: CreatePostTagDto,
  ) {
    return this.postTagService.create(createPostTagDto);
  }

  @Get('post/:postId')
  async findAllTagsByPostId(@Param('postId') postId: string) {
    return this.postTagService.findAllTagsByPostId(postId);
  }

  @Get('tag/:tagId')
  async findAllPostsByTagId(@Param('tagId') tagId: string) {
    return this.postTagService.findAllPostsByTagId(tagId);
  }

  @UseGuards(LoggedInOnly)
  @Delete(':id')
  async remove(
    @Body(new ZodValidationPipe(CreatePostTagSchema))
    removePostTagDto: RemovePostTagDto,
  ) {
    return this.postTagService.remove(removePostTagDto);
  }
}
