import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { RedisService } from 'src/redis/redis.service';
import { RoleEnum } from 'src/shared/enum/role.enum';
import { User } from 'src/user/model/user.model';
import { PendingPaymentResponseDto } from './dtos/pending-payment-response.dto';
import { SepayCallbackBodyDto } from './dtos/sepay-callback-body.dto';
import { Payment } from './model/payment.model';
import { MailingServiceService } from 'src/mailing-service/mailing-service.service';

@Injectable()
export class PaymentService {
  private PAYMENT_TTL_SECONDS: number = 600; //10 minutes
  private PAYMENT_REDIS_PREFIX: string = 'payment_pending:';

  constructor(
    @InjectModel(Payment)
    private paymentModel: typeof Payment,
    @InjectModel(User)
    private userModel: typeof User,

    private readonly redisService: RedisService,
    private readonly mailingService: MailingServiceService,
  ) {}

  async handleSepayCallbackAsync(
    callbackBody: SepayCallbackBodyDto,
  ): Promise<void> {
    var [paymentId, userId] = callbackBody.content.split('|');

    if (!paymentId || !userId) {
      if (!paymentId) {
        console.error(
          'Payment ID missing in Sepay callback content with id:',
          callbackBody.id,
        );
      }

      if (!userId) {
        console.error(
          'User Id missing in Sepay callback contentwith id:',
          callbackBody.id,
        );
      }
      return;
    }

    var user = await this.userModel.findByPk(userId);

    if (!user) {
      console.error(
        `User with id ${userId} not found for Sepay callback with id: ${callbackBody.id}`,
      );
      return;
    }

    try {
      //Update to pro user
      await this.userModel.update(
        { role: RoleEnum.PRO_USER },
        { where: { id: userId } },
      );

      //Create payment record
      var createdPayment = await this.paymentModel.create({
        id: paymentId,
        userId: userId,
        sepayId: callbackBody.id,
        gateway: callbackBody.gateway,
        accountNumber: callbackBody.accountNumber,
        transactionDate: new Date(callbackBody.transactionDate),
        code: callbackBody.code,
        amount: callbackBody.transferAmount,
      });

      // Delete pending payment from redis
      var pendingRecord = await this.redisService.get(
        this.PAYMENT_REDIS_PREFIX + userId,
      );
      if (pendingRecord) {
        await this.redisService.del(this.PAYMENT_REDIS_PREFIX + userId);
      }

      // send email
      await this.mailingService.sendPaymentCompletedEmail(
        user.username,
        createdPayment.id,
        createdPayment.transactionDate.toLocaleDateString(),
        createdPayment.amount,
        user.email,
      );
    } catch (error) {
      console.error(
        'Error processing Sepay callback with id:',
        callbackBody.id,
        error,
      );
    }
  }

  async createNewPendingPaymentAsync(
    userId: string,
  ): Promise<PendingPaymentResponseDto> {
    var user = await this.userModel.findByPk(userId);

    if (user?.role === RoleEnum.PRO_USER) {
      throw new ConflictException('This has already upgraded to pro user');
    }

    var existingPendingPayment = await this.redisService.get(
      this.PAYMENT_REDIS_PREFIX + userId,
    );

    if (existingPendingPayment) {
      var ttl = await this.redisService.ttl(this.PAYMENT_REDIS_PREFIX + userId);
      return {
        paymentId: existingPendingPayment,
        userId: userId,
        ttl: ttl,
      };
    }

    var key = this.PAYMENT_REDIS_PREFIX + userId;
    var value = crypto.randomUUID();

    var pendingPayment = await this.redisService.set(
      key,
      value,
      this.PAYMENT_TTL_SECONDS,
    );

    if (pendingPayment != 'OK') {
      throw new InternalServerErrorException(
        'Redis error createing pending payment',
      );
    }

    return {
      paymentId: value,
      userId: userId,
      ttl: this.PAYMENT_TTL_SECONDS,
    };
  }

  async getPendingPaymentsAsync(
    userId: string,
  ): Promise<PendingPaymentResponseDto | null> {
    var existingPendingPayment = await this.redisService.get(
      this.PAYMENT_REDIS_PREFIX + userId,
    );

    if (!existingPendingPayment) {
      return null;
    }

    var ttl = await this.redisService.ttl(this.PAYMENT_REDIS_PREFIX + userId);

    return {
      paymentId: existingPendingPayment,
      userId: userId,
      ttl: ttl,
    };
  }

  async getUserPaymentAsync(userId: string): Promise<Payment | null> {
    return await this.paymentModel.findOne({
      where: { userId: userId },
    });
  }
}
