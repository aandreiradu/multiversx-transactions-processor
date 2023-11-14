import { Module } from '@nestjs/common';
import { WatcherController } from './watcher.controller';
import { WatcherService } from './watcher.service';
import { WalletRepository } from '@app/common/wallet/wallet.repository';
import {
  PrismaModule,
  PrismaService,
  TransactionsRepository,
  validate,
} from '@app/common';
import { CustomRedisService } from '@app/common/redis/redis.service';
import { CustomRedisModule } from '@app/common/redis/redis.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate,
    }),
    PrismaModule,
    CustomRedisModule,
  ],
  controllers: [WatcherController],
  providers: [
    ConfigService,
    WatcherService,
    PrismaService,
    CustomRedisService,
    WalletRepository,
    TransactionsRepository,
  ],
})
export class WatcherModule {}
