import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { LoggedInOnly } from 'src/auth/guards/authenticated.guard';
import {
  PaginationDto,
  PaginationSchema,
} from 'src/shared/classes/pagination.dto';
import { Me } from 'src/shared/decorators/user.decorator';
import { ZodValidationPipe } from 'src/shared/pipes/zod.pipe';
import { User } from 'src/user/model/user.model';
import { CreatePostDto, CreatePostSchema } from './dtos/create-post.dto';
import { QueryPostDto, QueryPostSchema } from './dtos/query-post.dto';
import { UpdatePostDto, UpdatePostSchema } from './dtos/update-post.dto';
import { PostService } from './post.service';

@Controller({ path: 'post', version: '1' })
export class PostController {
  constructor(private postService: PostService) {}

  @UseGuards(LoggedInOnly)
  @Post()
  @UseInterceptors(FileInterceptor('thumbnail'))
  async createPost(
    @UploadedFile() thumbnail: Express.Multer.File,
    @Body(new ZodValidationPipe(CreatePostSchema)) createPostDto: CreatePostDto,
  ) {
    return this.postService.create(createPostDto, thumbnail);
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

  @Get()
  async getAllPosts(
    @Query(new ZodValidationPipe(QueryPostSchema)) query: QueryPostDto,
  ) {
    return this.postService.findAll(query);
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
