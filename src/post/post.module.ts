import { Module } from '@nestjs/common';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Post } from './model/post.model';
import { User } from 'src/user/model/user.model';
import { Tag } from 'src/tag/model/tag.model';
import { Comment } from 'src/comment/model/comment.model';
import { Post_Tag } from 'src/post-tag/model/post-tag.model';
import { UserModule } from 'src/user/user.module';
import { TagModule } from 'src/tag/tag.module';
import { Follow } from 'src/follow/model/follow.model';

@Module({
  imports: [
    SequelizeModule.forFeature([Post, User, Tag, Post_Tag, Comment, Follow]),
    UserModule,
    TagModule,
  ],
  controllers: [PostController],
  providers: [PostService],
  exports: [PostService],
})
export class PostModule {}
