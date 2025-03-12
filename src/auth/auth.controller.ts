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
import { CreateUserDto, CreateUserSchema } from 'src/user/dtos/create-user.dto';
import { SuccessResponse } from 'src/shared/classes/success-response.class';
import { LoginGuard } from './utils/login.guard';
import { AuthenticatedGuard } from './utils/authenticated.guard';
import { Request } from 'express';

@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LoginGuard)
  @Post('login')
  async login(@Req() req) {
    return req.user;
  }

  @Delete('logout')
  async logout(@Req() req: Request) {
    return req.session.destroy(() => {
      return 'Logged out';
    });
  }

  @Post('signin')
  async createUser(
    @Body(new ZodValidationPipe(CreateUserSchema)) userInfo: CreateUserDto,
  ) {
    const res = await this.authService.signIn(userInfo);
    return new SuccessResponse('Account created', res);
  }

  @UseGuards(AuthenticatedGuard)
  @Get('test-guard')
  async testGuard(@Req() req) {
    return req.user;
  }
}
