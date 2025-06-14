import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Comment } from './model/comment.model';
import { User } from 'src/user/model/user.model';
import { Post } from 'src/post/model/post.model';
import { CommentSentimentModule } from '../comment-sentiment/comment-sentiment.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Comment, User, Post]),
    CommentSentimentModule,
  ],
  controllers: [CommentController],
  providers: [CommentService],
})
export class CommentModule {}
