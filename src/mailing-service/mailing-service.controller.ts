import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { SuccessResponse } from 'src/shared/classes/success-response.class';
import { MailingServiceService } from './mailing-service.service';

@Controller({
  version: '1',
  path: 'mail',
})
export class MailingServiceController {
  constructor(
    private readonly mailingService: MailingServiceService,
    private readonly configService: ConfigService,
  ) {}

  @Get('/verify-email')
  async verifyEmail(@Query('token') token: string, @Res() res: Response) {
    var redirectUrl = this.configService.getOrThrow('BASE_FRONTEND_URL');

    try {
      await this.mailingService.verifyEmail(token);
      redirectUrl += '/mail/verification-success';
      res.redirect(redirectUrl);
    } catch (err) {
      var problem = err.response.errors[0].message;
      redirectUrl += `/mail/verification-failed?problem=${problem}`;
      res.redirect(redirectUrl);
    }
  }

  @Post('/resend-verification')
  async resendVerification(@Body('email') email: string) {
    await this.mailingService.resendVerificationEmail(email);
    return new SuccessResponse('Verification email resent', null);
  }
}
