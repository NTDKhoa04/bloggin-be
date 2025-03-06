import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';

import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { ZodValidationPipe } from 'src/shared/pipes/zod.pipe';
import { CreateUserDto, CreateUserSchema } from 'src/user/dtos/create-user.dto';
import { SuccessResponse } from 'src/shared/classes/success-response.class';

@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req) {
    return req.user;
  }

  @Post('signin')
  async createUser(
    @Body(new ZodValidationPipe(CreateUserSchema)) userInfo: CreateUserDto,
  ) {
    const res = await this.authService.signIn(userInfo);
    return new SuccessResponse('Account created', res);
  }
}
