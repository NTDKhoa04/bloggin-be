import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';

import { Request } from 'express';
import { SuccessResponse } from 'src/shared/classes/success-response.class';
import { Me } from 'src/shared/decorators/user.decorator';
import { ZodValidationPipe } from 'src/shared/pipes/zod.pipe';
import {
  CreateLocalUserDto,
  CreateLocalUserSchema,
} from 'src/user/dtos/create-user.dto';
import { User } from 'src/user/model/user.model';
import { AuthService } from './auth.service';
import { LoggedInOnly } from './guards/authenticated.guard';
import { GoogleAuthenticated } from './guards/google.guard';
import { LoginGuard } from './guards/login.guard';
import { AdminOnly } from './guards/role.guard';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

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
    console.log('redirect by login route');
    return new SuccessResponse('Redirecting to Google login');
  }

  @UseGuards(GoogleAuthenticated)
  @Get('google/redirect')
  async googleRedirect(@Res() res) {
    console.log('Google redirect called');
    return res.redirect(`${process.env.FRONTEND_URL}`);
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

  @Get('validate-session')
  validateSession(@Req() req: AuthenticatedRequest) {
    if (req.user) {
      return new SuccessResponse('Session is Valid', {
        valid: true,
      });
    } else {
      throw new Error('Session is Invalid');
    }
  }

  @UseGuards(AdminOnly)
  @Get('test-guard')
  async testGuard(@Req() req) {
    return req.user;
  }
}
