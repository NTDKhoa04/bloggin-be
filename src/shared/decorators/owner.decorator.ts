// owner.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const OWNER_CHECK_KEY = 'ownerCheck';

export interface OwnerCheckOptions {
  resourceService: any; // Expect the class/constructor here
  resourceIdParam?: string;
  authorField?: string;
}

export const OwnerCheck = (options: OwnerCheckOptions) =>
  SetMetadata(OWNER_CHECK_KEY, options);
