import {
  ConflictException,
  HttpCode,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  NotImplementedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './model/user.model';
import { CreateUserDto, CreateUserSchema } from './dtos/create-user.dto';
import { UniqueConstraintError } from 'sequelize';
import {
  ValidationError,
  ValidationErrorDetail,
} from 'src/shared/classes/validation-error.class';
import { QueryUserDto } from './dtos/query-user.sto';
import * as argon2 from 'argon2';
import { ChangePasswordDto } from './dtos/change-password.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
  ) {}
  async findUserById(id: string): Promise<User> {
    const res = await this.userModel.findOne({ where: { id: id } });
    if (!res) throw new NotFoundException(`User with id ${id} not found`);
    return res;
  }

  async findUsers(query: Partial<QueryUserDto>): Promise<User[]> {
    const user = query
      ? await this.userModel.findAll({ where: query })
      : await this.userModel.findAll();
    return user;
  }

  async createUser(userInfo: CreateUserDto): Promise<User> {
    try {
      const hashedPassword = await argon2.hash(userInfo.password);
      const info = { ...userInfo, password: hashedPassword };
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

  async updateUser(
    id: string,
    userInfo: Partial<CreateUserDto>,
  ): Promise<User> {
    try {
      const [rows, res] = await this.userModel.update(
        { ...userInfo },
        { where: { id }, returning: true },
      );
      if (rows === 0)
        throw new NotFoundException(`User with id ${id} not found`);
      return res[0].dataValues as User;
    } catch (err) {
      if (err instanceof NotFoundException) {
        throw err;
      }
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

  async changePassword(id: string, data: ChangePasswordDto) {
    const user = await this.userModel.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User with id ${id} not found`);
    try {
      if (!(await argon2.verify(user.password, data.oldPassword)))
        throw new ConflictException('Password is incorrect');
      const newPassword = await argon2.hash(data.newPassword);
      await this.userModel.update({ password: newPassword }, { where: { id } });
    } catch (err) {
      if (err instanceof ConflictException) {
        throw err;
      }
      throw new InternalServerErrorException(err);
    }
  }
}
