import { HttpStatus } from '@nestjs/common';

export class ValidationErrorDetail {
  field: string;
  message: string;
  constructor(field: string, message: string) {
    this.field = field;
    this.message = message;
  }
}

export class ValidationError {
  statusCode: HttpStatus;
  errors: ValidationErrorDetail[];
  constructor(errors: ValidationErrorDetail[], statusCode: HttpStatus) {
    this.errors = errors;
    this.statusCode = statusCode;
  }
}
