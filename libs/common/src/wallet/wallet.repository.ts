import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CustomRedisService } from '../redis/redis.service';
import { Wallet } from '@prisma/client';
import { cachedWalletFormat } from 'libs/common/constants/services';
import { availableCoins } from 'apps/watcher/src/dtos';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaErrorTypes } from 'libs/common/constants/prisma';

@Injectable()
export class WalletRepository {
  private logger: Logger = new Logger(WalletRepository.name);
  constructor(
    private readonly prismaService: PrismaService,
    private readonly redisService: CustomRedisService,
  ) {}

  async createWallet(
    dto: Pick<Wallet, 'addressId' | 'name'>,
  ): Promise<{ addressId: string }> {
    try {
      const wallet = await this.prismaService.wallet.create({
        data: {
          ...dto,
        },
      });

      this.logger.log(
        `Successfully created wallet for address => ${dto.addressId}`,
      );
      return { addressId: wallet.addressId };
    } catch (error) {
      if (error.constructor.name === PrismaClientKnownRequestError.name) {
        if (error.code === PrismaErrorTypes.UniqueConstraint) {
          this.logger.warn(`Wallet already created. Skipping...`);
          return { addressId: dto.addressId };
        }
      }

      this.logger.error(`Unable to create wallet => ${JSON.stringify(dto)}`);
      this.logger.error(error);

      throw new InternalServerErrorException();
    }
  }

  async cacheWallet(addressId: string): Promise<void> {
    try {
      let walletFormat = cachedWalletFormat;
      walletFormat = walletFormat.replace('{walletId}', addressId);
      await this.redisService.set(walletFormat, addressId);
    } catch (error) {
      this.logger.error(`Unable to cache wallet => ${addressId}`);
      this.logger.error(JSON.stringify(error));
      throw new InternalServerErrorException();
    }
  }

  async checkWalletExistence(
    addressId: string,
  ): Promise<{ addressId: string } | null> {
    this.logger.log(`Starting to check wallet existance => ${addressId}`);
    try {
      let walletFormat = cachedWalletFormat;
      walletFormat = walletFormat.replace('{walletId}', addressId);
      const cachedWallet = await this.redisService.get<{ addressId: string }>(
        walletFormat,
      );

      if (cachedWallet) {
        return cachedWallet;
      }

      return this.prismaService.wallet.findFirst({
        where: {
          addressId: addressId,
        },
        select: {
          addressId: true,
        },
      });
    } catch (error) {
      this.logger.error(`Unable to check wallet existance => ${addressId}`);
      this.logger.error(JSON.stringify(error));
      throw new InternalServerErrorException();
    }
  }

  async getWalletSentAmountByCoin(
    addressId: string,
    coin: availableCoins,
  ): Promise<{ value: string }[] | null> {
    const walletTransactions = await this.prismaService.transactions.findMany({
      where: {
        senderId: addressId,
        coin,
      },
      select: {
        value: true,
      },
    });

    return walletTransactions?.length > 0 ? walletTransactions : null;
  }
}
