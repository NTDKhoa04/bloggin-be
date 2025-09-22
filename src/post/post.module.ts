import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Comment } from 'src/comment/model/comment.model';
import { Post_Tag } from 'src/post-tag/model/post-tag.model';
import { Tag } from 'src/tag/model/tag.model';
import { TtsModule } from 'src/tts/tts.module';
import { User } from 'src/user/model/user.model';
import { UserModule } from 'src/user/user.module';
import { TagModule } from 'src/tag/tag.module';
import { Follow } from 'src/follow/model/follow.model';
import { Post } from './model/post.model';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Post, User, Tag, Post_Tag, Comment, Follow]),
    UserModule,
    TagModule,
    TtsModule,
    CloudinaryModule,
  ],
  controllers: [PostController],
  providers: [PostService],
  exports: [PostService],
})
export class PostModule {}
