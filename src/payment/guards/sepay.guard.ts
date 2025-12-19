import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';

@Injectable()
export class SepayGuard implements CanActivate {
  private readonly SEPAY_HEADER_API_KEY = 'authorization';

  constructor(private readonly configService: ConfigService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    var apiKey = this.configService.getOrThrow('SEPAY_API_KEY');

    const req = context.switchToHttp().getRequest();
    var header = req.headers[this.SEPAY_HEADER_API_KEY];

    return header === apiKey;
  }
}
