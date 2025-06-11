import { Module } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { StatisticsController } from './statistics.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Tag } from 'src/tag/model/tag.model';
import { User } from 'src/user/model/user.model';
import { Favorite } from 'src/favorite/model/favorite.model';
import { Follow } from 'src/follow/model/follow.model';
import { Comment } from 'src/comment/model/comment.model';
import { Post } from 'src/post/model/post.model';

@Module({
  imports: [
    SequelizeModule.forFeature([Post, User, Tag, Follow, Favorite, Comment]),
  ],
  controllers: [StatisticsController],
  providers: [StatisticsService],
})
export class StatisticsModule {}
