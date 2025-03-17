import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
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

@Controller({
  path: 'user',
  version: '1',
})
export class UserController {
  constructor(private userService: UserService) {}

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
  ) {
    const { password, ...data } = await this.userService.updateUser(
      id!,
      userInfo,
    );
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
    const formatedRes = res.map((user) => {
      const { password, ...data } = user.dataValues;
      return data;
    });
    return new SuccessResponse('Users found', formatedRes);
  }

  @Get(':id')
  async findUserById(@Param('id') id: string) {
    const res = await this.userService.findUserById(id);
    return new SuccessResponse('User found', res);
  }
}
