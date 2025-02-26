import {
  ArgumentMetadata,
  BadRequestException,
  HttpStatus,
  InternalServerErrorException,
  PipeTransform,
} from '@nestjs/common';
import { ZodError, ZodSchema } from 'zod';
import {
  ValidationError,
  ValidationErrorDetail,
} from '../classes/validation-error.class';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    try {
      const parsedValue = this.schema.parse(value);
      return parsedValue;
    } catch (err) {
      if (err instanceof ZodError) {
        const errorMessages = err.errors.map((error) => {
          const details: ValidationErrorDetail = new ValidationErrorDetail(
            error.path.join('.'),
            error.message,
          );
          return details;
        });
        throw new BadRequestException(
          new ValidationError(errorMessages, HttpStatus.BAD_REQUEST),
        );
      } else {
        throw new InternalServerErrorException();
      }
    }
  }
}
