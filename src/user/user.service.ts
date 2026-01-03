import {
  ConflictException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/sequelize';
import * as argon2 from 'argon2';
import { Op, UniqueConstraintError } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import {
  ValidationError,
  ValidationErrorDetail,
} from 'src/shared/classes/validation-error.class';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { CreateUserDto } from './dtos/create-user.dto';
import { QueryUserDto } from './dtos/query-user.dto';
import { User } from './model/user.model';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
    @InjectConnection()
    private readonly sequelize: Sequelize,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async updateAvatar(id: string, file: Express.Multer.File): Promise<User> {
    const user = await this.userModel.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User with id ${id} not found`);
    try {
      const { secure_url } = await this.cloudinaryService.uploadImage(file);
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

  async findUserByIds(ids: string[]): Promise<User[]> {
    const res = await this.userModel.findAll({
      where: { id: { [Op.in]: ids } },
      attributes: { exclude: ['password'] },
    });

    return res;
  }

  async findUsers(query: Partial<QueryUserDto>): Promise<Partial<User>[]> {
    const { tag, ...formatedQuery } = query;

    if (!tag) {
      const user = query
        ? await this.userModel.findAll({ where: formatedQuery })
        : await this.userModel.findAll();
      const formatedRes = user.map((user) => {
        const { password, ...data } = user.dataValues;
        return data;
      });
      return formatedRes;
    }

    const resultWithTags = (
      await this.sequelize.query(`
        select distinct "Users".id, username, email, "displayName", "avatarUrl", "isVerified", "role", "loginMethod", "Users"."createdAt", "Users"."updatedAt", "specialties", "about"
          from "Users", "Posts", "Tags", "Post_Tags"
          where "Tags".name = '${tag}'
          and "Users"."id" = "Posts"."authorId"
          and "Posts".id = "Post_Tags"."postId"
          and "Tags".id = "Post_Tags"."tagId"
          `)
    )[0];
    const user = resultWithTags as User[];
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

  async getUsersByNameAsync(name: string): Promise<User[]> {
    const users = await this.userModel.findAll({
      where: {
        [Op.and]: [
          {
            [Op.or]: [
              { displayName: { [Op.iLike]: `%${name}%` } },
              { username: { [Op.iLike]: `%${name}%` } },
            ],
          },
          { username: { [Op.not]: 'admin' } },
        ],
      },
      attributes: { exclude: ['password'] },
    });

    return users;
  }
}
