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
        models: [User, Post, Tag, Post_Tag],
      }),
    }),
    ScheduleModule.forRoot(),
    UserModule,
    AuthModule,
    PostModule,
    TagModule,
    PostTagModule,
    PassportModule.register({ session: true }),
    DraftModule,
  ],
  controllers: [AppController],
  providers: [AppService, AdminOnly],
})
export class AppModule {}
