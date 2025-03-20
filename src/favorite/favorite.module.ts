import { Module } from '@nestjs/common';
import { FavoriteService } from './favorite.service';
import { FavoriteController } from './favorite.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Favorite } from './model/favorite.model';
import { User } from 'src/user/model/user.model';
import { Post } from 'src/post/model/post.model';

@Module({
  imports: [SequelizeModule.forFeature([Favorite, Post, User])],
  controllers: [FavoriteController],
  providers: [FavoriteService],
})
export class FavoriteModule {}
