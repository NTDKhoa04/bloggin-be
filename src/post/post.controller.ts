import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto, CreatePostSchema } from './dtos/create-post.dto';
import { ZodValidationPipe } from 'src/shared/pipes/zod.pipe';
import { UpdatePostDto, UpdatePostSchema } from './dtos/update-post.dto';

@Controller({ path: 'post', version: '1' })
export class PostController {
  constructor(private postService: PostService) {}

  // @Get('/test')
  // async test() {
  //   throw new ConflictException();
  // }

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
  async getAllPosts() {
    return this.postService.findAll();
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
