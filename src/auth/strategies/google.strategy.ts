import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import { LoginMethodEmun } from 'src/shared/enum/login-method.enum';
import { CreateGoogleUserDto } from 'src/user/dtos/create-user.dto';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.getOrThrow('OAUTH_CLIENT_ID'),
      clientSecret: configService.getOrThrow('OAUTH_CLIENT_SECRET'),
      callbackURL: configService.getOrThrow('OAUTH_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
  ): Promise<void> {
    if (!profile) throw new Error('Google profile not found');
    const userData: CreateGoogleUserDto = {
      username: profile.username ?? profile.displayName,
      email: profile.emails![0].value,
      displayName: profile.displayName,
      avatarUrl: profile.photos && profile.photos[0].value,
      loginMethod: LoginMethodEmun.GOOGLE,
      isVerified: profile.emails![0].verified,
    };
    const user = this.authService.validateGoogleUser(userData);
    return user || null;
  }
}
