import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SenderAssets } from '@prisma/client';
import { CustomRedisService } from '../redis/redis.service';
import { TransactionExtended } from '../types';
import {
  senderCacheFormat,
  receiverCacheFormat,
} from 'libs/common/constants/services';

@Injectable()
export class TransactionsRepository {
  private logger: Logger = new Logger(TransactionsRepository.name);
  constructor(
    private readonly prismaService: PrismaService,
    private readonly redisService: CustomRedisService,
  ) {}

  async saveTransaction(transaction: TransactionExtended): Promise<void> {
    this.logger.log(`received this transaction to save => ${transaction}`);
    this.logger.log(`Starting to save ${transaction.txHash} transactions...`);
    try {
      await this.prismaService.transactions.upsert({
        where: {
          txHash: transaction.txHash,
        },
        create: transaction,
        update: {
          ...transaction,
        },
      });

      this.logger.log(
        `Successfully saved transaction => ${transaction.txHash}`,
      );
    } catch (error) {
      this.logger.error(`Unable to save transaction => ${transaction}`);
      this.logger.error(`Error saving transaction => ${JSON.stringify(error)}`);
      throw new InternalServerErrorException(`Unable to save transaction`);
    }
  }

  async cacheTransaction(transaction: TransactionExtended): Promise<void> {
    this.logger.log(`received this transaction to cache => ${transaction}`);
    try {
      let senderFormat = senderCacheFormat;
      let receiverFormat = receiverCacheFormat;
      senderFormat =
        transaction.sender &&
        senderFormat
          .replace('{senderId}', transaction.sender)
          .replace('{coinType}', transaction.coin);

      receiverFormat =
        transaction.receiver &&
        receiverFormat
          .replace('{receiverId}', transaction.receiver)
          .replace('{coinType}', transaction.coin);

      this.logger.log(`senderFormat => ${senderFormat}`);
      this.logger.log(`receiverFormat => ${receiverFormat}`);

      await this.redisService.set(senderFormat, transaction.value);
      await this.redisService.set(receiverFormat, transaction.value);

      this.logger.log(`Finished to cache the transaction...`);
    } catch (error) {
      this.logger.error(`Unable to cache transaction => `);
      throw new InternalServerErrorException();
    }
  }

  async getTransaction(transactionHash: string) {
    try {
      // const cachedTransaction = await this.redisService.get();
    } catch (error) {
      this.logger.error(`Unable to get transaction => ${transactionHash}`);
      throw new InternalServerErrorException();
    }
  }

  async getSenderAssets(id: string): Promise<SenderAssets | null> {
    try {
      return this.prismaService.senderAssets.findFirst({
        where: {
          id,
        },
      });
    } catch (error) {
      this.logger.error(`Unable to get sender assets for id => ${id}`);
      throw new InternalServerErrorException();
    }
  }
}
