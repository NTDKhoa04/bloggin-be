import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserModule } from './user/user.module';
import { User } from './user/model/user.model';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PostModule } from './post/post.module';
import { Post } from './post/model/post.model';
import { TagModule } from './tag/tag.module';
import { Tag } from './tag/model/tag.model';
import { PostTagModule } from './post-tag/post-tag.module';
import { Post_Tag } from './post-tag/model/post-tag.model';
import { ScheduleModule } from '@nestjs/schedule';
import { PassportModule } from '@nestjs/passport';
import { DraftModule } from './draft/draft.module';
import { AdminOnly } from './auth/guards/role.guard';
import { Draft } from './draft/model/draft.model';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { FollowModule } from './follow/follow.module';
import { CommentModule } from './comment/comment.module';
import { Comment } from './comment/model/comment.model';
import { Follow } from './follow/model/follow.model';
import { FavoriteModule } from './favorite/favorite.module';
import { TtsModule } from './tts/tts.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SequelizeModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        dialect: 'postgres',
        port: config.getOrThrow<number>('DB_PORT'),
        host: config.getOrThrow<string>('DB_HOST'),
        username: config.getOrThrow<string>('DB_USERNAME'),
        password: config.getOrThrow<string>('DB_PASSWORD'),
        database: config.getOrThrow<string>('DB_NAME'),
        autoLoadModels: true,
        sync: { alter: true },
        logging: false,
        models: [User, Post, Tag, Post_Tag, Draft, Comment, Follow],
      }),
    }),
    ScheduleModule.forRoot(),
    UserModule,
    AuthModule,
    PostModule,
    TagModule,
    PostTagModule,
    DraftModule,
    PassportModule.register({ session: true }),
    CloudinaryModule,
    FollowModule,
    CommentModule,
    FavoriteModule,
    TtsModule,
  ],
  controllers: [AppController],
  providers: [AppService, AdminOnly],
})
export class AppModule {}
