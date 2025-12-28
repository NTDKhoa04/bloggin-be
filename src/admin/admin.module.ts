import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Tag } from 'src/tag/model/tag.model';
import { User } from 'src/user/model/user.model';
import { Favorite } from 'src/favorite/model/favorite.model';
import { Follow } from 'src/follow/model/follow.model';
import { Comment } from 'src/comment/model/comment.model';
import { Post } from 'src/post/model/post.model';
import { MailingServiceModule } from 'src/mailing-service/mailing-service.module';
import { Payment } from 'src/payment/model/payment.model';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Post,
      User,
      Tag,
      Follow,
      Favorite,
      Comment,
      Payment,
    ]),
    MailingServiceModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
