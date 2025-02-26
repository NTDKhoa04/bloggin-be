import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, CreateUserSchema } from './dtos/create-user.dto';
import { ZodValidationPipe } from 'src/shared/pipes/zod.pipe';
import { SuccessResponse } from 'src/shared/classes/success-response.class';
import { QueryUserDto, QueryUserSchema } from './dtos/query-user.sto';
import {
  ChangePasswordDto,
  ChangePasswordSchema,
} from './dtos/change-password.dto';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}
  @Post()
  async createUser(
    @Body(new ZodValidationPipe(CreateUserSchema)) userInfo: CreateUserDto,
  ) {
    const res = await this.userService.createUser(userInfo);
    return new SuccessResponse('User created', res);
  }

  @Patch(':id')
  async updateUser(
    @Param('id') id: string,
    @Body(
      new ZodValidationPipe(
        CreateUserSchema.partial().omit({ password: true }).strict(),
      ),
    )
    userInfo: Partial<CreateUserDto>,
  ) {
    const { password, ...data } = await this.userService.updateUser(
      id,
      userInfo,
    );
    return new SuccessResponse('User updated', data);
  }

  @Patch(':id/password')
  async changePassword(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(ChangePasswordSchema.strict()))
    data: ChangePasswordDto,
  ) {
    await this.userService.changePassword(id, data);
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
    const res = await this.userService.findUserById(id);
    return new SuccessResponse('User found', res);
  }
}
