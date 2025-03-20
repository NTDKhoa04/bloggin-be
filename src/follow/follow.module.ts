import { Module } from '@nestjs/common';
import { FollowService } from './follow.service';
import { FollowController } from './follow.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Follow } from './model/follow.model';
import { User } from 'src/user/model/user.model';

@Module({
  imports: [SequelizeModule.forFeature([Follow, User])],
  controllers: [FollowController],
  providers: [FollowService],
  exports: [FollowService],
})
export class FollowModule {}
