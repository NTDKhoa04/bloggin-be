import {
  ConflictException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import * as argon2 from 'argon2';
import { UniqueConstraintError } from 'sequelize';
import { EmailVerificationReplacementsDto } from 'src/mailing-service/dto/mail-replacements.dto';
import { MailingServiceService } from 'src/mailing-service/mailing-service.service';
import {
  ValidationError,
  ValidationErrorDetail,
} from 'src/shared/classes/validation-error.class';
import {
  CreateGoogleUserDto,
  CreateLocalUserDto,
} from 'src/user/dtos/create-user.dto';
import { User } from 'src/user/model/user.model';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
    private readonly mailingService: MailingServiceService,
  ) {}

  private isEmail(identifier: string): boolean {
    return /\S+@\S+\.\S+/.test(identifier);
  }

  async validateUser(identifier: string, password: string): Promise<any> {
    const condition = this.isEmail(identifier)
      ? { email: identifier }
      : { username: identifier };
    const user = await this.userModel.findOne({
      where: condition,
    });
    const realUser = user?.dataValues;
    if (!realUser) throw new NotFoundException('User not found');
    const isPasswordCorrect = await argon2.verify(realUser.password, password);
    if (isPasswordCorrect) {
      const { password, ...result } = realUser;
      return result;
    }
    return null;
  }

  async validateGoogleUser(userInfo: CreateGoogleUserDto): Promise<any> {
    const user = await this.userModel.findOne({
      where: { email: userInfo.email },
    });
    if (user) {
      return user;
    }
    const createdUser = await this.userModel.create(userInfo);
    return createdUser;
  }

  async signIn(userInfo: CreateLocalUserDto): Promise<User> {
    try {
      //Creating user
      const hashedPassword = await argon2.hash(userInfo.password);
      const info = {
        ...userInfo,
        password: hashedPassword,
      };
      await this.userModel.create(info);
      const createdUser = await this.userModel.findOne({
        where: { username: userInfo.username },
      });

      //Check if user is created
      if (!createdUser)
        throw new InternalServerErrorException(
          'Something went wrong with creating new user',
        );

      //Send account verification email
      await this.mailingService.sendVerificationEmail(
        createdUser.id,
        createdUser.displayName,
        createdUser.email,
      );

      return createdUser.dataValues;
    } catch (err) {
      if (err instanceof UniqueConstraintError) {
        const errorDetails = err.errors.map((error) => {
          return new ValidationErrorDetail(error.path!, error.message);
        });
        throw new ConflictException(
          new ValidationError(errorDetails, HttpStatus.CONFLICT),
        );
      } else throw new InternalServerErrorException();
    }
  }
}
