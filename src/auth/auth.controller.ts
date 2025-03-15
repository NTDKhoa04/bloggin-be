import {
  Body,
  ConsoleLogger,
  Controller,
  Delete,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { ZodValidationPipe } from 'src/shared/pipes/zod.pipe';
import { CreateUserDto, CreateUserSchema } from 'src/user/dtos/create-user.dto';
import { SuccessResponse } from 'src/shared/classes/success-response.class';
import { LoginGuard } from './utils/login.guard';
import { LoggedInOnly } from './utils/authenticated.guard';
import { Request } from 'express';
import { Roles } from 'src/shared/classes/role.decorator';
import { RoleEnum } from 'src/shared/enum/role.enum';
import { AdminOnly } from './utils/role.guard';

@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LoginGuard)
  @Post('login')
  async login(@Req() req) {
    return new SuccessResponse(`Logged in as ${req.user.username}`);
  }

  @UseGuards(LoggedInOnly)
  @Delete('logout')
  async logout(@Req() req: Request) {
    req.session.destroy(() => {});
    return new SuccessResponse('Logged out');
  }

  @Post('signin')
  async createUser(
    @Body(new ZodValidationPipe(CreateUserSchema)) userInfo: CreateUserDto,
  ) {
    const res = await this.authService.signIn(userInfo);
    return new SuccessResponse('Account created', res);
  }

  @UseGuards(AdminOnly)
  @Get('test-guard')
  async testGuard(@Req() req) {
    return req.user;
  }
}
