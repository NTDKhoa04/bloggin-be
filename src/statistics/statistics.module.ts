import { Module } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { StatisticsController } from './statistics.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from 'src/user/model/user.model';
import { Follow } from 'src/follow/model/follow.model';

@Module({
  imports: [SequelizeModule.forFeature([])],
  controllers: [StatisticsController],
  providers: [StatisticsService],
})
export class StatisticsModule {}
