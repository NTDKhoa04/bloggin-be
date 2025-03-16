import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { serializeUserRequest } from '../filters/user.serializer';

export const Me = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    if (!request.isAuthenticated()) return undefined;
    return serializeUserRequest(request.user);
  },
);
