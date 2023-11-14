import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CustomRedisService } from '../redis/redis.service';
import { Wallet } from '@prisma/client';
import { cachedWalletFormat } from 'libs/common/constants/services';

@Injectable()
export class WalletRepository {
  private logger: Logger = new Logger(WalletRepository.name);
  constructor(
    private readonly prismaService: PrismaService,
    private readonly redisService: CustomRedisService,
  ) {}

  async createWallet(dto: Pick<Wallet, 'addressId' | 'name'>): Promise<Wallet> {
    try {
      const wallet = await this.prismaService.wallet.create({
        data: {
          ...dto,
        },
      });

      this.logger.log(
        `Successfully created wallet for address => ${dto.addressId}`,
      );
      return wallet;
    } catch (error) {
      this.logger.error(`Unable to create wallet => ${JSON.stringify(dto)}`);
      this.logger.error(JSON.stringify(error));

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

  async checkWalletExistence(addressId: string): Promise<Wallet | null> {
    this.logger.log(`Starting to check wallet existance => ${addressId}`);
    try {
      let walletFormat = cachedWalletFormat;
      walletFormat = walletFormat.replace('{walletId}', addressId);
      const cachedWallet = await this.redisService.get<Wallet>(walletFormat);

      if (cachedWallet) {
        return cachedWallet;
      }

      return this.prismaService.wallet.findFirst({
        where: {
          addressId: addressId,
        },
      });
    } catch (error) {
      this.logger.error(`Unable to check wallet existance => ${addressId}`);
      this.logger.error(JSON.stringify(error));
      throw new InternalServerErrorException();
    }
  }
}
