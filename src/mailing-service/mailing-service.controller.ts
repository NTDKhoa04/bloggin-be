import { Controller, Post } from '@nestjs/common';
import { MailingServiceService } from './mailing-service.service';

@Controller({
  version: '1',
  path: 'mail',
})
export class MailingServiceController {
  constructor(private readonly mailingService: MailingServiceService) {}

  @Post()
  async sendTestMail() {
    const result = await this.mailingService.sendTestEmail();
    return result;
  }
}
