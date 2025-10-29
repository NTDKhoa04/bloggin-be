import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from 'src/user/user.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategies/local.strategy';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from 'src/user/model/user.model';
import { SessionSerializer } from './strategies/session-serializer';
import { GoogleStrategy } from './strategies/google.strategy';
import { MailingServiceModule } from 'src/mailing-service/mailing-service.module';

@Module({
  imports: [
    UserModule,
    SequelizeModule.forFeature([User]),
    PassportModule.register({ session: true }),
    MailingServiceModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, SessionSerializer, GoogleStrategy],
})
export class AuthModule {}
