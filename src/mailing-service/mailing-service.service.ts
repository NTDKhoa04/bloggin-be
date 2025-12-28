import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Options, SentMessageInfo } from 'nodemailer/lib/smtp-transport';
import { MailTemplatesEnum } from 'src/shared/enum/mail-templates.enum';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import {
  AdminUnflagReplacementsDto,
  AdminWarningReplacementsDto,
  EmailVerificationReplacementsDto,
  MailReplacementsDto,
  PaymentCompletedReplacementsDto,
} from './dto/mail-replacements.dto';
import MailContentDto from './dto/mail-content.dto';
import * as Redis from 'redis';
import * as crypto from 'crypto';
import { InjectModel } from '@nestjs/sequelize';
import { User } from 'src/user/model/user.model';
import {
  ValidationError,
  ValidationErrorDetail,
} from 'src/shared/classes/validation-error.class';
import { VerificationProblemsEnum } from 'src/shared/enum/verification-problems.enum';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class MailingServiceService {
  private readonly transporter: nodemailer.Transporter<
    SentMessageInfo,
    Options
  >;

  private TOKEN_TTL_SECONDS: number = 900; //15 minutes
  private readonly TOKEN_PREFIX: string = 'email_verify:token:';
  private readonly LOOKUP_TOKEN_PREFIX: string = 'email_verify:lookup:';

  constructor(
    @InjectModel(User)
    private userModel: typeof User,

    private readonly configService: ConfigService,

    private readonly redisService: RedisService,
  ) {
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

  private async generateToken(
    userId: string,
    email: string,
  ): Promise<string | undefined> {
    try {
      var token = crypto.randomBytes(32).toString('hex');

      //Official token
      await this.redisService.set(
        this.TOKEN_PREFIX + token,
        userId,
        this.TOKEN_TTL_SECONDS,
      );

      //Lookup token
      await this.redisService.set(
        this.LOOKUP_TOKEN_PREFIX + email,
        email,
        this.TOKEN_TTL_SECONDS,
      );

      return token;
    } catch (err) {
      console.error('Error while generating token:', err);
    }
  }

  public async sendVerificationEmail(
    userId: string,
    displayName: string,
    email: string,
  ) {
    try {
      var verifyToken = await this.generateToken(userId, email);

      var baseBackendUrl = this.configService.getOrThrow('BASE_BACKEND_URL');

      var replacements: EmailVerificationReplacementsDto = {
        username: displayName,
        verifyLink: `${baseBackendUrl}/mail/verify-email?token=${verifyToken}`,
      };

      const htmlString = this.getHtmlString(
        MailTemplatesEnum.MAIL_VERIFICATION,
        replacements,
      );

      const mailContent: MailContentDto = {
        from: 'info@bloggin.blog',
        to: email,
        subject: 'Bloggin - Verify your email address',
        html: htmlString,
      };

      await this.transporter.sendMail(mailContent);
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }

  public async resendVerificationEmail(email: string) {
    var lookupToken = await this.redisService.get(
      this.LOOKUP_TOKEN_PREFIX + email,
    );

    if (lookupToken != null) {
      throw new ConflictException(
        new ValidationError(
          [
            new ValidationErrorDetail(
              'email',
              'Verification email is still valid. Check your email or wait a moment before trying again.',
            ),
          ],
          HttpStatus.CONFLICT,
        ),
      );
    }

    var user = await this.userModel.findOne({ where: { email: email } });

    if (!user) {
      throw new NotFoundException(
        new ValidationError(
          [new ValidationErrorDetail('email', 'User not found')],
          HttpStatus.NOT_FOUND,
        ),
      );
    }

    if (user.isVerified) {
      throw new BadRequestException(
        new ValidationError(
          [new ValidationErrorDetail('email', 'User already been verified')],
          HttpStatus.BAD_REQUEST,
        ),
      );
    }

    await this.sendVerificationEmail(user.id, user.username, user.email);
  }

  public async verifyEmail(token: string): Promise<void> {
    var userId = await this.redisService.get(this.TOKEN_PREFIX + token);

    if (!userId) {
      throw new BadRequestException(
        new ValidationError(
          [
            new ValidationErrorDetail(
              'token',
              VerificationProblemsEnum.TOKEN_INVALID,
            ),
          ],
          HttpStatus.BAD_REQUEST,
        ),
      );
    }

    var user = await this.userModel.findByPk(userId);

    if (!user) {
      throw new NotFoundException(
        new ValidationError(
          [
            new ValidationErrorDetail(
              'email',
              VerificationProblemsEnum.USER_NOT_FOUND,
            ),
          ],
          HttpStatus.NOT_FOUND,
        ),
      );
    }

    if (user.isVerified) {
      throw new BadRequestException(
        new ValidationError(
          [
            new ValidationErrorDetail(
              'email',
              VerificationProblemsEnum.USER_ALREADY_VERIFIED,
            ),
          ],
          HttpStatus.BAD_REQUEST,
        ),
      );
    }

    await this.userModel.update(
      { isVerified: true },
      { where: { id: userId } },
    );

    await this.redisService.del(this.TOKEN_PREFIX + token);
    await this.redisService.del(this.LOOKUP_TOKEN_PREFIX + user.email);
  }

  async sendAdminWarningEmail(email: string, username: string, postId: string) {
    var baseFrontendUrl = this.configService.getOrThrow('BASE_FRONTEND_URL');

    var postLink = baseFrontendUrl + '/blog/' + postId;

    var replacements: AdminWarningReplacementsDto = {
      username: username,
      postLink: postLink,
    };

    var htmlString = this.getHtmlString(
      MailTemplatesEnum.ADMIN_WARNING,
      replacements,
    );

    var mailContent: MailContentDto = {
      from: 'info@bloggin.blog',
      to: email,
      subject: 'Bloggin - Your blog has been restricted',
      html: htmlString,
    };

    try {
      await this.transporter.sendMail(mailContent);
    } catch (error) {
      console.error('Error sending admin warning email:', error);
    }
  }

  async sendAdminUnflagEmail(email: string, username: string, postId: string) {
    var baseFrontendUrl = this.configService.getOrThrow('BASE_FRONTEND_URL');

    var postLink = baseFrontendUrl + '/blog/' + postId;

    var replacements: AdminUnflagReplacementsDto = {
      username: username,
      postLink: postLink,
    };

    var htmlString = this.getHtmlString(
      MailTemplatesEnum.ADMIN_UNFLAG,
      replacements,
    );

    var mailContent: MailContentDto = {
      from: 'info@bloggin.blog',
      to: email,
      subject: 'Bloggin - Your blog restriction has been lifted',
      html: htmlString,
    };

    try {
      await this.transporter.sendMail(mailContent);
    } catch (error) {
      console.error('Error sending admin warning email:', error);
    }
  }

  async sendPaymentCompletedEmail(
    username: string,
    transactionId: string,
    date: string,
    amount: number,
    email: string,
  ) {
    var baseFrontendUrl = this.configService.getOrThrow('BASE_FRONTEND_URL');

    var dashboardLink = baseFrontendUrl + '/setting/profile';

    var replacements: PaymentCompletedReplacementsDto = {
      username: username,
      transactionId: transactionId,
      date: date,
      amount: amount.toString(),
      dashboardLink: dashboardLink,
    };

    var htmlString = this.getHtmlString(
      MailTemplatesEnum.PAYMENT_COMPLETED,
      replacements,
    );

    var mailContent: MailContentDto = {
      from: 'info@bloggin.blog',
      to: email,
      subject: 'Bloggin - Your account has been upgraded',
      html: htmlString,
    };

    try {
      await this.transporter.sendMail(mailContent);
    } catch (error) {
      console.error('Error sending payment email:', error);
    }
  }
}
