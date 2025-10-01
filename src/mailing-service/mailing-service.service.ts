import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Options, SentMessageInfo } from 'nodemailer/lib/smtp-transport';
import { MailTemplatesEnum } from 'src/shared/enum/mail-templates.enum';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import MailReplacementsDto from './dto/mail-replacements.dto';

@Injectable()
export class MailingServiceService {
  private readonly transporter: nodemailer.Transporter<
    SentMessageInfo,
    Options
  >;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: configService.getOrThrow('MAILTRAP_HOST'),
      port: configService.getOrThrow('MAILTRAP_PORT'),
      auth: {
        user: configService.getOrThrow('MAILTRAP_USER'),
        pass: configService.getOrThrow('MAILTRAP_PASS'),
      },
    });
  }

  private addReplacements(
    htmlString: string,
    replacements: MailReplacementsDto,
  ): string {
    return htmlString.replace(/%(\w*)%/g, function (_, key) {
      return replacements.hasOwnProperty(key) ? replacements[key] : '';
    });
  }

  private getHtmlString(
    template: MailTemplatesEnum,
    replacements: MailReplacementsDto,
  ): string {
    const templatePath = path.join(__dirname, 'templates', template);

    const htmlString = fs.readFileSync(templatePath, 'utf-8');

    const htmlStringWithReplacements = this.addReplacements(
      htmlString,
      replacements,
    );

    return htmlStringWithReplacements;
  }

  public async sendTestEmail() {
    try {
      const replacements: MailReplacementsDto = {
        username: 'Khoa',
        link: 'https://www.google.com',
      };
      const template = this.getHtmlString(
        MailTemplatesEnum.ADMIN_WARNING,
        replacements,
      );

      // const mailContent: MailContentDto = {
      //   from: 'Bloggin',
      //   to: 'nguyenthaidangkhoa04@gmail.com',
      //   subject: 'Another Test Email',
      //   html: template,
      // };

      // const results = await this.transporter.sendMail(mailContent);

      return template;
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }
}
