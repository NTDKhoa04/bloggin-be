import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Payment } from './model/payment.model';
import { RedisModule } from 'src/redis/redis.module';
import { User } from 'src/user/model/user.model';
import { MailingServiceModule } from 'src/mailing-service/mailing-service.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Payment, User]),
    RedisModule,
    MailingServiceModule,
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}
