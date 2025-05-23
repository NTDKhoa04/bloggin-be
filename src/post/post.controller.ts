import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
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
import { Me } from 'src/shared/decorators/user.decorator';
import { ZodValidationPipe } from 'src/shared/pipes/zod.pipe';
import { User } from 'src/user/model/user.model';
import { CreatePostDto, CreatePostSchema } from './dtos/create-post.dto';
import { UpdatePostDto, UpdatePostSchema } from './dtos/update-post.dto';
import { PostService } from './post.service';
import { TtsService } from 'src/tts/tts.service';
import extractTextFromPostContent from 'src/shared/utils/extractTextFromPostContent';

@Controller({ path: 'post', version: '1' })
export class PostController {
  constructor(private postService: PostService) {}

  @UseGuards(LoggedInOnly)
  @Post()
  async createPost(
    @Body(new ZodValidationPipe(CreatePostSchema)) createPostDto: CreatePostDto,
  ) {
    return this.postService.create(createPostDto);
  }

  @UseGuards(LoggedInOnly)
  @Patch('/:id')
  async updatePost(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdatePostSchema)) updatePostDto: UpdatePostDto,
    @Me() user: Partial<User>,
  ) {
    const { id: userId, ...userWithoutId } = user;
    return this.postService.update(id, updatePostDto, userId ?? '');
  }

  @Get('/all')
  async getAllPosts(
    @Query(new ZodValidationPipe(PaginationSchema)) pagination: PaginationDto,
  ) {
    return this.postService.findAll(pagination);
  }

  @Get('/author/:id')
  async getPostsByAuthor(
    @Param('id') id: string,
    @Query(new ZodValidationPipe(PaginationSchema)) pagination: PaginationDto,
  ) {
    return this.postService.findByAuthor(id ? id : '', pagination);
  }

  @UseGuards(LoggedInOnly)
  @Get('/following')
  async getFollowingPosts(
    @Me() { id }: Partial<User>,
    @Query(new ZodValidationPipe(PaginationSchema)) pagination: PaginationDto,
  ) {
    await this.postService.getFollowingPost(id!, pagination);
  }

  @Get('/:id')
  async getPostById(@Param('id') id: string) {
    return this.postService.findOne(id);
  }

  @UseGuards(LoggedInOnly)
  @Delete('/:id')
  async deletePost(@Param('id') id: string) {
    return this.postService.remove(id);
  }

  @Get('/synthesize/:postId')
  async synthesizeTextToFile(
    @Param('postId') postId: string,
    @Query('language') language: string,
  ) {
    return await this.postService.synthesizePostById(postId, language);
  }
}
