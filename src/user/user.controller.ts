import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, CreateUserSchema } from './dtos/create-user.dto';
import { ZodValidationPipe } from 'src/shared/pipes/zod.pipe';
import { SuccessResponse } from 'src/shared/classes/success-response.class';
import { QueryUserDto, QueryUserSchema } from './dtos/query-user.dto';
import {
  ChangePasswordDto,
  ChangePasswordSchema,
} from './dtos/change-password.dto';
import { Me } from 'src/shared/decorators/user.decorator';
import { User } from './model/user.model';
import { LoggedInOnly } from 'src/auth/guards/authenticated.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';

@Controller({
  path: 'user',
  version: '1',
})
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(LoggedInOnly)
  @Patch('avatar')
  @UseInterceptors(FileInterceptor('file'))
  async updateAvatar(
    @Me() { id }: Partial<User>,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const result = await this.userService.updateAvatar(id!, file);
    return new SuccessResponse('Avatar updated', result);
  }

  @UseGuards(LoggedInOnly)
  @Patch()
  async updateUser(
    @Me() { id }: Partial<User>,
    @Body(
      new ZodValidationPipe(
        CreateUserSchema.partial()
          .omit({ password: true, isVerified: true, loginMethod: true })
          .strict(),
      ),
    )
    userInfo: Partial<CreateUserDto>,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.userService.updateUser(id!, userInfo);
    if (!user) {
      res.statusCode = HttpStatus.NOT_MODIFIED;
      return;
    }
    const { password, ...data } = user;
    return new SuccessResponse('User updated', data);
  }

  @UseGuards(LoggedInOnly)
  @Patch('password')
  async changePassword(
    @Me() { id }: Partial<User>,
    @Body(new ZodValidationPipe(ChangePasswordSchema.strict()))
    data: ChangePasswordDto,
  ) {
    await this.userService.changePassword(id!, data);
    return new SuccessResponse('Password updated', null);
  }

  @Get()
  async findUsers(
    @Query(new ZodValidationPipe(QueryUserSchema.partial().strict()))
    query: Partial<QueryUserDto>,
  ) {
    const res = await this.userService.findUsers(query);
    return new SuccessResponse('Users found', res);
  }

  @Get(':id')
  async findUserById(@Param('id') id: string) {
    const user = await this.userService.findUserById(id);
    const { password, ...res } = user.dataValues;
    return new SuccessResponse('User found', res);
  }
}
