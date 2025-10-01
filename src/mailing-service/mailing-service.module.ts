import { Module } from '@nestjs/common';
import { MailingServiceService } from './mailing-service.service';
import { MailingServiceController } from './mailing-service.controller';

@Module({
  providers: [MailingServiceService],
  controllers: [MailingServiceController]
})
export class MailingServiceModule {}
