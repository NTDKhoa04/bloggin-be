import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { ZodValidationPipe } from 'src/shared/pipes/zod.pipe';
import {
  CreateLocalUserDto,
  CreateLocalUserSchema,
  CreateUserDto,
  CreateUserSchema,
} from 'src/user/dtos/create-user.dto';
import { SuccessResponse } from 'src/shared/classes/success-response.class';
import { LoginGuard } from './guards/login.guard';
import { LoggedInOnly } from './guards/authenticated.guard';
import { Request } from 'express';
import { AdminOnly } from './guards/role.guard';
import { Me } from 'src/shared/decorators/user.decorator';
import { User } from 'src/user/model/user.model';
import { GoogleAuthenticated } from './guards/google.guard';

@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LoginGuard)
  @Post('login')
  async login(@Me() user: Partial<User>) {
    const { password, ...res } = user;
    return new SuccessResponse('Logged in', res);
  }

  @UseGuards(GoogleAuthenticated)
  @Get('google/login')
  async googleLogin() {
    return new SuccessResponse('Redirecting to Google login');
  }

  @UseGuards(GoogleAuthenticated)
  @Get('google/redirect')
  async googleRedirect() {
    return new SuccessResponse('Google login successful');
  }

  @Post('register')
  async createUser(
    @Body(new ZodValidationPipe(CreateLocalUserSchema))
    userInfo: CreateLocalUserDto,
  ) {
    const createdUser = await this.authService.signIn(userInfo);
    const { password, ...res } = createdUser;
    return new SuccessResponse('Account created', res);
  }

  @UseGuards(LoggedInOnly)
  @Delete('logout')
  async logout(@Req() req: Request) {
    req.session.destroy(() => {});
    return new SuccessResponse('Logged out');
  }

  @UseGuards(LoggedInOnly)
  @Get('me')
  async getMe(@Me() user: Partial<User>) {
    const { password, ...res } = user;
    return new SuccessResponse('Current user retrieved', res);
  }

  @UseGuards(AdminOnly)
  @Get('test-guard')
  async testGuard(@Req() req) {
    return req.user;
  }
}
