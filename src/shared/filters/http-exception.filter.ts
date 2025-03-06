import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let responseBody: any = {
      message: 'Internal server error',
      errors: [],
    };

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const res = exception.getResponse();

      // If the response has an "errors" property, use that.
      if (
        typeof res === 'object' &&
        res !== null &&
        (res as any).errors &&
        Array.isArray((res as any).errors)
      ) {
        responseBody = {
          errors: (res as any).errors,
          message: (res as any).message || exception.message,
        };
      } else {
        responseBody = {
          message: exception.message,
          errors: [],
        };
      }
    } else if (exception instanceof Error) {
      responseBody = {
        message: exception.message,
        errors: [],
      };
    }

    // Optionally add path and statusCode
    responseBody.statusCode = statusCode;
    responseBody.path = httpAdapter.getRequestUrl(ctx.getRequest());

    httpAdapter.reply(ctx.getResponse(), responseBody, statusCode);
  }
}
