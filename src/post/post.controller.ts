import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  Delete,
  Put,
  Query,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto, CreatePostSchema } from './dtos/create-post.dto';
import { ZodValidationPipe } from 'src/shared/pipes/zod.pipe';
import { UpdatePostDto, UpdatePostSchema } from './dtos/update-post.dto';
import { Me } from 'src/shared/decorators/user.decorator';
import { User } from 'src/user/model/user.model';
import {
  PaginationDto,
  PaginationSchema,
} from 'src/shared/classes/pagination.dto';

@Controller({ path: 'post', version: '1' })
export class PostController {
  constructor(private postService: PostService) {}
  @Post()
  async createPost(
    @Body(new ZodValidationPipe(CreatePostSchema)) createPostDto: CreatePostDto,
  ) {
    return this.postService.create(createPostDto);
  }

  @Put('/:id')
  async updatePost(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdatePostSchema)) updatePostDto: UpdatePostDto,
  ) {
    return this.postService.update(id, updatePostDto);
  }

  @Get('/all')
  async getAllPosts(
    @Query(new ZodValidationPipe(PaginationSchema)) pagination: PaginationDto,
  ) {
    return this.postService.findAll(pagination);
  }

  @Get('/author')
  async getPostsByAuthor(@Me() user: Partial<User>) {
    const { id, ...userWithoutId } = user;
    return this.postService.findByAuthor(id ? id : '');
  }

  @Get('/:id')
  async getPostById(@Param('id') id: string) {
    return this.postService.findOne(id);
  }

  @Delete('/:id')
  async deletePost(@Param('id') id: string) {
    return this.postService.remove(id);
  }
}
