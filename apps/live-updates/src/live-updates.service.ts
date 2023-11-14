import { Injectable, Logger } from '@nestjs/common';
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

      const senderWallet = await this.walletRepository.checkWalletExistence(
        transaction.senderId,
      );

      if (!senderWallet) {
        this.logger.warn(
          `No wallet found for sender => ${transaction.senderId}`,
        );
        await this.walletRepository.createWallet({
          addressId: transaction.senderId,
          name: 'MVX_WALLET_DEVNET',
        });
        await this.walletRepository.cacheWallet(transaction.senderId);
      }

      const receiverWallet = await this.walletRepository.checkWalletExistence(
        transaction.receiverId,
      );
      if (!receiverWallet) {
        this.logger.warn(
          `No wallet found for receiver => ${transaction.receiverId}`,
        );
        await this.walletRepository.createWallet({
          addressId: transaction.receiverId,
          name: 'MVX_WALLET_DEVNET',
        });
        await this.walletRepository.cacheWallet(transaction.senderId);
      }

      await this.transactionsRepository.saveTransaction(transaction);
      await this.transactionsRepository.cacheTransaction(transaction);
      this.logger.log(
        `Successfully processed transaction => ${transaction.hash}`,
      );
    } catch (error) {
      throw error;
    }
  }
}
