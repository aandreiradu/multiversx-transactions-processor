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
              if (!transaction.data) continue;

              const decodedData = Buffer.from(
                transaction.data,
                'base64',
              ).toString();
              const coin = decodedData.slice(0, 4);
              Object.assign(transaction, {
                decodedData,
                coin,
              });
              if (coin.includes('ESDT') || coin.includes('EGLD')) {
                this.logger.log(
                  `Valid transaction detected => ${transaction.hash}`,
                );
                // await this.deleteCacheKey(`pong:${transaction.sender}`);
                this.transactionsClient.emit(
                  'process_transaction',
                  JSON.stringify(transaction),
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
