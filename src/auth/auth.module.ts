import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from 'src/user/user.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './utils/local.strategy';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from 'src/user/model/user.model';

@Module({
  imports: [UserModule, PassportModule, SequelizeModule.forFeature([User])],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy],
})
export class AuthModule {}
