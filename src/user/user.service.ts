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
import { QueryUserDto } from './dtos/query-user.dto';
import * as argon2 from 'argon2';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async updateAvatar(id: string, file: Express.Multer.File): Promise<User> {
    const user = await this.userModel.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User with id ${id} not found`);
    try {
      const { secure_url } = await this.cloudinaryService.uploadFile(file);
      await user.update(
        { avatarUrl: secure_url },
        { where: { id }, returning: true },
      );
      return secure_url;
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

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

  async updateUser(
    id: string,
    userInfo: Partial<CreateUserDto>,
  ): Promise<User | null> {
    try {
      const [rows, res] = await this.userModel.update(
        { ...userInfo },
        { where: { id }, returning: true },
      );
      if (rows === 0) return null;
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
