import { Module } from '@nestjs/common';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Post } from './model/post.model';

@Module({
  imports: [SequelizeModule.forFeature([Post])],
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule {}
