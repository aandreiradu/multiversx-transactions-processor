import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Transactions } from '@prisma/client';
import { CustomRedisService } from '../redis/redis.service';
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

  async saveTransaction(transaction: Transactions): Promise<void> {
    this.logger.log(`Starting to save transaction ${transaction.hash}`);
    try {
      await this.prismaService.transactions.create({
        data: {
          ...transaction,
          createdAt: new Date(),
        },
      });
      this.logger.log(`Successfully saved transaction => ${transaction.hash}`);
    } catch (error) {
      this.logger.error(
        `Unable to save transaction => ${JSON.stringify(transaction)}`,
      );
      this.logger.error(JSON.stringify(error, null, 2));
      throw new InternalServerErrorException(`Unable to save transaction`);
    }
  }

  async cacheTransaction(transaction: Transactions): Promise<void> {
    this.logger.log(`Starting to cache ${transaction.hash} transaction`);
    this.logger.log(JSON.stringify(transaction));
    try {
      let senderFormat = senderCacheFormat;
      let receiverFormat = receiverCacheFormat;

      // Maybe to move it to atomic fn
      senderFormat =
        transaction.senderId &&
        senderFormat
          .replace('{walletId}', transaction.senderId)
          .replace('{coinType}', transaction.coin);

      receiverFormat =
        transaction.receiverId &&
        receiverFormat
          .replace('{walletId}', transaction.receiverId)
          .replace('{coinType}', transaction.coin);

      await this.redisService.setList(senderFormat, transaction.value);
      await this.redisService.setList(receiverFormat, transaction.value);

      this.logger.log(`Finished to cache transaction ${transaction.hash}`);
    } catch (error) {
      this.logger.log(
        `Unable to cache transaction => ${JSON.stringify(transaction)}`,
      );
      this.logger.error(error);
      throw new InternalServerErrorException();
    }
  }

  // async getSenderAssets(id: string): Promise<SenderAssets | null> {
  //   try {
  //     return this.prismaService.senderAssets.findFirst({
  //       where: {
  //         id,
  //       },
  //     });
  //   } catch (error) {
  //     this.logger.error(`Unable to get sender assets for id => ${id}`);
  //     this.logger.error(error);
  //     throw new InternalServerErrorException();
  //   }
  // }
}
