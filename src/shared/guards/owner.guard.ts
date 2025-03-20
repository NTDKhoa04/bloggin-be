import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { ModuleRef, Reflector } from '@nestjs/core';
import {
  OwnerCheckOptions,
  OWNER_CHECK_KEY,
} from '../decorators/owner.decorator';

@Injectable()
export class OwnerGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly moduleRef: ModuleRef,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) {
      throw new UnauthorizedException('You are not logged in');
    }

    // Get metadata from @OwnerCheck
    const options = this.reflector.get<OwnerCheckOptions>(
      OWNER_CHECK_KEY,
      context.getHandler(),
    );

    if (!options) {
      return true;
    }

    const {
      resourceService,
      resourceIdParam = 'id',
      authorField = 'authorId',
    } = options;
    const resourceId = request.params[resourceIdParam];
    if (!resourceId) {
      throw new ForbiddenException('Resource id is missing');
    }

    // Resolve service instance dynamically
    const serviceInstance = this.moduleRef.get(resourceService, {
      strict: false,
    });

    // Determine the model name from the service (assuming it follows naming convention)
    const modelName = `${resourceService.name.replace('Service', '').toLowerCase()}Model`;
    const model = (serviceInstance as any)[modelName];

    if (!model) {
      throw new Error(`Model ${modelName} not found in service`);
    }

    // Fetch the resource
    const resource = await model.findByPk(resourceId);
    if (!resource) {
      throw new ForbiddenException('Resource not found');
    }

    // Check if user is the owner
    if (resource[authorField] !== user.id) {
      throw new ForbiddenException(
        'You are not authorized to update this resource',
      );
    }

    return true;
  }
}
