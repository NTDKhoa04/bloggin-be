import { Module } from '@nestjs/common';
import { MailingServiceService } from './mailing-service.service';
import { MailingServiceController } from './mailing-service.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from 'src/user/model/user.model';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [SequelizeModule.forFeature([User])],
  providers: [MailingServiceService],
  controllers: [MailingServiceController],
  exports: [MailingServiceService],
})
export class MailingServiceModule {}
