import {
  TransactionProcessorMode,
  TransactionProcessor,
} from '@multiversx/sdk-transaction-processor';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { LockResource } from '@app/common/utils/lockResource';
import { TRANSACTIONS_SERVICE } from '../../../../libs/common/constants/services';
import { ClientProxy } from '@nestjs/microservices';
import { Transactions } from '@prisma/client';

@Injectable()
export class ServiceWorkersService {
  private readonly logger: Logger = new Logger(ServiceWorkersService.name);
  private lastNonce: number | undefined;
  private transactionProcessor: TransactionProcessor =
    new TransactionProcessor();

  constructor(
    private readonly configService: ConfigService,
    @Inject(TRANSACTIONS_SERVICE) private transactionsClient: ClientProxy,
  ) {}

  @Cron('*/1 * * * * *')
  async handleTransactions() {
    this.logger.warn(`running handle transactions job`);
    await LockResource.lock('mvxTransactions', async () => {
      this.logger.error(
        `RECEIVED NEW TRANSACTIONS UPDATES => ${new Date().toISOString()}`,
      );
      await this.transactionProcessor.start({
        mode: TransactionProcessorMode.Hyperblock,
        gatewayUrl: this.configService.get<string>('gatewayURL'),
        getLastProcessedNonce: async (shardId) => {
          this.logger.log('getLastProcessedNonce', shardId);
          return this.lastNonce;
        },
        setLastProcessedNonce: async (shardId, nonce) => {
          this.logger.log('setLastProcessedNonce', shardId, nonce);
          this.lastNonce = nonce;
        },
        onTransactionsReceived: async (
          shardId,
          nonce,
          transactions,
          statistics,
        ) => {
          this.logger.log(
            `Received ${transactions.length} transactions on shard ${shardId} and nonce ${nonce}. Time left: ${statistics.secondsLeft}`,
          );
          try {
            for (const transaction of transactions) {
              if (!transaction.data) return;

              const decodedData = Buffer.from(
                transaction.data,
                'base64',
              ).toString();
              const coin = decodedData.slice(0, 4);
              this.logger.error(`coin => ${coin}`);
              if (coin.includes('ESDT') || coin.includes('EGLD')) {
                this.logger.log(
                  `Valid transaction detected => ${JSON.stringify(
                    transaction,
                  )}`,
                );

                const mappedTransactionModel: Transactions = {
                  ...transaction,
                  value: '5999200000000000000', // in https://gateway.multiversx.com, found only transactions with value 0
                  coin,
                  senderId: transaction.sender,
                  previousTransactionHash:
                    transaction?.previousTransactionHash ?? null,
                  originalTransactionHash:
                    transaction.originalTransactionHash ?? null,
                  receiverId: transaction.receiver,
                  data: transaction.data,
                  gasPrice: transaction.gasPrice,
                  gasLimit: transaction.gasLimit,
                  createdAt: undefined,
                };

                delete mappedTransactionModel['sender'];
                delete mappedTransactionModel['receiver'];
                this.transactionsClient.emit(
                  'process_transaction',
                  JSON.stringify(mappedTransactionModel),
                );
              }
            }
          } catch (error) {
            this.logger.error(`Unable to receive live updates`);
            this.logger.error(error);
            process.exit(1);
          }
        },
      });
    });
  }
}
