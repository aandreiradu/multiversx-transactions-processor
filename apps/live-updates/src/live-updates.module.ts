import { Module } from '@nestjs/common';
import { ServiceWorkersModule } from './service-workers/service-workers.module';
import { ConfigModule } from '@nestjs/config';
import { RmqModule, TransactionsRepository, validate } from '@app/common';
import { PrismaModule } from '@app/common';
import { LiveUpdatesService } from './live-updates.service';
import { LiveUpdatesController } from './live-updates.controller';
import { TRANSACTIONS_SERVICE } from '../../../libs/common/constants/services';
import { CustomRedisModule } from '@app/common/redis/redis.module';
import { CustomRedisService } from '@app/common/redis/redis.service';
import { WalletRepository } from '@app/common/wallet/wallet.repository';

@Module({
  imports: [
    PrismaModule,
    ServiceWorkersModule,
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate,
    }),
    RmqModule.register({
      name: TRANSACTIONS_SERVICE,
    }),
    CustomRedisModule,
  ],
  providers: [
    LiveUpdatesService,
    TransactionsRepository,
    WalletRepository,
    CustomRedisService,
  ],
  controllers: [LiveUpdatesController],
  exports: [LiveUpdatesService],
})
export class LiveUpdatesModule {}
