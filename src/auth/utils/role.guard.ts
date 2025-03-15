import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectModel } from '@nestjs/sequelize';
import { ROLES_KEY } from 'src/shared/classes/role.decorator';
import { RoleEnum } from 'src/shared/enum/role.enum';

@Injectable()
export class AdminOnly implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    console.log('at role guard');

    const req = context.switchToHttp().getRequest();
    if (!req.isAuthenticated()) {
      throw new UnauthorizedException("You're not logged in");
    }
    return req.user.dataValues.isAdmin;
  }
}
