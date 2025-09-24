import { Module } from '@nestjs/common';
import { PostTagService } from './post-tag.service';
import { PostTagController } from './post-tag.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Post_Tag } from './model/post-tag.model';
import { Tag } from 'src/tag/model/tag.model';
import { Post } from 'src/post/model/post.model';
import { User } from 'src/user/model/user.model';

@Module({
  imports: [SequelizeModule.forFeature([Post_Tag, Post, Tag, User])],
  controllers: [PostTagController],
  providers: [PostTagService],
  exports: [PostTagService],
})
export class PostTagModule {}
