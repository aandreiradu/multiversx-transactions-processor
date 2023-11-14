import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CustomRedisService } from '../redis/redis.service';
import { Wallet } from '@prisma/client';

@Injectable()
export class WalletRepository {
  private logger: Logger = new Logger(WalletRepository.name);
  constructor(
    private readonly prismaService: PrismaService,
    private readonly redisService: CustomRedisService,
  ) {}

  async createWallet(dto: Pick<Wallet, 'addressId' | 'name'>): Promise<Wallet> {
    try {
      return this.prismaService.wallet.create({
        data: {
          ...dto,
        },
      });
    } catch (error) {
      this.logger.error(`Unable to create wallet => ${JSON.stringify(dto)}`);
      this.logger.error(JSON.stringify(error));

      throw new InternalServerErrorException();
    }
  }

  async cacheWallet(walletId: string): Promise<void> {
    try {
      await this.redisService.set(walletId, walletId);
    } catch (error) {
      this.logger.error(`Unable to cache wallet => ${walletId}`);
      this.logger.error(JSON.stringify(error));
      throw new InternalServerErrorException();
    }
  }

  async checkWalletExistence(addressId: string): Promise<Wallet | null> {
    this.logger.log(`Starting to check wallet existance => ${addressId}`);
    try {
      const cachedWallet = await this.redisService.get<Wallet>(addressId);

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
