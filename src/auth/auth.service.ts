import {
  ConflictException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { InjectModel } from '@nestjs/sequelize';
import { User } from 'src/user/model/user.model';
import { CreateUserDto } from 'src/user/dtos/create-user.dto';
import { UniqueConstraintError } from 'sequelize';
import {
  ValidationError,
  ValidationErrorDetail,
} from 'src/shared/classes/validation-error.class';
import { RoleEnum } from 'src/shared/enum/role.enum';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
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
    console.log(user);
    const realUser = user?.dataValues;
    if (!realUser) throw new NotFoundException('User not found');
    const isPasswordCorrect = await argon2.verify(realUser.password, password);
    if (isPasswordCorrect) {
      const { password, ...result } = realUser;
      return result;
    }
    return null;
  }

  async signIn(userInfo: CreateUserDto): Promise<User> {
    try {
      const hashedPassword = await argon2.hash(userInfo.password);
      const info = {
        ...userInfo,
        password: hashedPassword,
      };
      const createdUser = await this.userModel.create(info);
      return createdUser;
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
