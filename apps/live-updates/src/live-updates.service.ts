import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { TransactionsRepository } from '@app/common';
import { convertTokenValue } from '@app/common/utils/decoding';
import { WalletRepository } from '@app/common/wallet/wallet.repository';
import { Transactions } from '@prisma/client';

@Injectable()
export class LiveUpdatesService {
  private logger: Logger = new Logger(LiveUpdatesService.name);
  constructor(
    private transactionsRepository: TransactionsRepository,
    private readonly walletRepository: WalletRepository,
  ) {}

  async processTransaction(transaction: Transactions): Promise<void> {
    try {
      this.logger.log(`Starting to process transaction => ${transaction.hash}`);
      const tokenValue = convertTokenValue(String(transaction.value));
      transaction.value = String(tokenValue);

      let [senderWallet, receiverWallet] = await Promise.all([
        this.walletRepository.checkWalletExistence(transaction.senderId),
        this.walletRepository.checkWalletExistence(transaction.receiverId),
      ]);

      if (!senderWallet) {
        this.logger.warn(
          `No wallet found for sender => ${transaction.senderId}`,
        );
        senderWallet = await this.walletRepository.createWallet({
          addressId: transaction.senderId,
          name: 'MVX_WALLET_DEVNET',
        });
        await this.walletRepository.cacheWallet(senderWallet.addressId);
      }

      if (!receiverWallet) {
        this.logger.warn(
          `No wallet found for receiver => ${transaction.receiverId}`,
        );
        receiverWallet = await this.walletRepository.createWallet({
          addressId: transaction.receiverId,
          name: 'MVX_WALLET_DEVNET',
        });
        await this.walletRepository.cacheWallet(receiverWallet.addressId);
      }

      if (senderWallet && receiverWallet) {
        this.logger.log(`Both wallets found => proceed to save transaction`);
        await this.transactionsRepository.saveTransaction(transaction);
        await this.transactionsRepository.cacheTransaction(transaction);
        this.logger.log(
          `Successfully processed & cached transaction => ${transaction.hash}`,
        );
      } else {
        this.logger.error(
          `Missing sender/receiver wallet => stopping transaction save`,
        );
        this.logger.error({ senderWallet, receiverWallet });
        throw new InternalServerErrorException();
      }
    } catch (error) {
      throw error;
    }
  }
}
