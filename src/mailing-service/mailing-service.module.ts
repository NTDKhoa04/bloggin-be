import { Module } from '@nestjs/common';
import { MailingServiceService } from './mailing-service.service';
import { MailingServiceController } from './mailing-service.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from 'src/user/model/user.model';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [SequelizeModule.forFeature([User]), RedisModule],
  providers: [MailingServiceService],
  controllers: [MailingServiceController],
  exports: [MailingServiceService],
})
export class MailingServiceModule {}
