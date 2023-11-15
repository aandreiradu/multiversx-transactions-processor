import { WalletRepository } from '@app/common/wallet/wallet.repository';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { availableCoins } from './dtos';
import {
  senderCacheFormat,
  receiverCacheFormat,
} from 'libs/common/constants/services';
import { CustomRedisService } from '@app/common/redis/redis.service';

@Injectable()
export class WatcherService {
  private logger: Logger = new Logger(WatcherService.name);
  constructor(
    private readonly walletRepository: WalletRepository,
    private readonly redisService: CustomRedisService,
  ) {}

  async getWalletAmount(
    addressId: string,
    coin: availableCoins,
    type: 'sent' | 'received',
  ): Promise<number> {
    try {
      const walletExists = await this.walletRepository.checkWalletExistence(
        addressId,
      );
      if (!walletExists) {
        this.logger.log(`No wallet found for address => ${addressId}`);
        throw new BadRequestException('Wallet not found');
      }

      let cacheFormat;

      switch (type) {
        case 'sent': {
          cacheFormat = senderCacheFormat;
          cacheFormat = cacheFormat
            .replace('{walletId}', addressId)
            .replace('{coinType}', coin);

          break;
        }

        case 'received': {
          cacheFormat = receiverCacheFormat;
          cacheFormat = cacheFormat
            .replace('{walletId}', addressId)
            .replace('{coinType}', coin);

          break;
        }

        default: {
          this.logger.error(`Unhandled type => ${type}`);
          throw new InternalServerErrorException();
        }
      }

      const cachedAmount = await this.redisService.getList<string>(cacheFormat);

      if (cachedAmount?.length) {
        return +cachedAmount
          .reduce((acc, val) => (acc = acc + +val), 0)
          .toFixed(4);
      } else {
        const walletSentTransactions =
          await this.walletRepository.getWalletSentAmountByCoin(
            addressId,
            coin,
          );

        console.log('walletSentTransactions', walletSentTransactions);

        if (!walletSentTransactions) {
          this.logger.log(
            `No transactions found for wallet => ${addressId} coin => ${coin}`,
          );
          return 0;
        }

        const concurrentlyCaching = [];
        for (const transaction of walletSentTransactions) {
          concurrentlyCaching.push(
            this.redisService.setList(cacheFormat, transaction.value),
          );
        }
        await Promise.all(concurrentlyCaching);

        const sentAmount = walletSentTransactions.reduce(
          (prev, val) => (prev += prev + +val.value),
          0,
        );
        return sentAmount;
      }
    } catch (error) {
      this.logger.error(
        `Unable to get wallet sent amounts for address => ${addressId} coin => ${coin}`,
      );
      this.logger.error(error);
      throw error;
    }
  }
}
