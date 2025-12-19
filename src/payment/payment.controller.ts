import {
  Body,
  Controller,
  Get,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import {
  SepayCallbackBodyDto,
  SepayCallbackBodySchema,
} from './dtos/sepay-callback-body.dto';
import { ZodValidationPipe } from 'src/shared/pipes/zod.pipe';
import { SepayGuard } from './guards/sepay.guard';
import { LoggedInOnly } from 'src/auth/guards/authenticated.guard';
import { Me } from 'src/shared/decorators/user.decorator';
import { User } from 'src/user/model/user.model';
import { SuccessResponse } from 'src/shared/classes/success-response.class';
import { AccountVerifiedGuard } from 'src/shared/guards/account-verified.guard';

@Controller({ path: 'payment', version: '1' })
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @UseGuards(SepayGuard)
  @Post('sepay-callback')
  async handleSepayCallback(
    @Body(new ZodValidationPipe(SepayCallbackBodySchema))
    callbackBody: SepayCallbackBodyDto,
  ) {
    return await this.paymentService.handleSepayCallbackAsync(callbackBody);
  }

  @Post('sepay-callback/test')
  async handleTestSepayCallback(
    @Body(new ZodValidationPipe(SepayCallbackBodySchema))
    callbackBody: SepayCallbackBodyDto,
  ) {
    await this.paymentService.createNewPendingPaymentAsync('user-123');
    return;
  }

  @UseGuards(LoggedInOnly, AccountVerifiedGuard)
  @Post()
  async createNewPendingPaymentAsync(@Me() { id }: Partial<User>) {
    if (!id) {
      throw new UnauthorizedException();
    }

    var result = await this.paymentService.createNewPendingPaymentAsync(id);
    return new SuccessResponse('Pending payment created', result);
  }

  @UseGuards(LoggedInOnly, AccountVerifiedGuard)
  @Get('/pending')
  async getPendingPaymentAsync(@Me() { id }: Partial<User>) {
    if (!id) {
      throw new UnauthorizedException();
    }

    var result = await this.paymentService.getPendingPaymentsAsync(id);

    if (!result) {
      return new SuccessResponse('User has no pending payment', null);
    }

    return new SuccessResponse('Pending payment retrieved', result);
  }

  @UseGuards(LoggedInOnly)
  @Get()
  async getUserPaymentAsync(@Me() { id }: Partial<User>) {
    if (!id) {
      throw new UnauthorizedException();
    }

    var result = await this.paymentService.getUserPaymentAsync(id);

    if (!result) {
      return new SuccessResponse('User has no payment', null);
    }

    return new SuccessResponse('Payment retrieved', result);
  }
}
