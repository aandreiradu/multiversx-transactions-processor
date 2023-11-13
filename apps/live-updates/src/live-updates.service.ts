import { Injectable, Logger } from '@nestjs/common';
import { TransactionsRepository } from '@app/common';
import { convertTokenValue } from '@app/common/utils/decoding';
import { TransactionExtended } from '@app/common/types';
// import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class LiveUpdatesService {
  private logger: Logger = new Logger(LiveUpdatesService.name);
  constructor(private transactionsRepository: TransactionsRepository) {}

  async processTransaction(transaction: TransactionExtended): Promise<void> {
    const tokenValue = convertTokenValue(String(transaction.value));

    // Convert the number back to Decimal
    // const decimalValue: Decimal = new Decimal(tokenValue);

    transaction.value = String(tokenValue);
    // this.logger.log('decimalValue', decimalValue);

    await this.transactionsRepository.saveTransaction(transaction);
    await this.transactionsRepository.cacheTransaction(transaction);
  }
}
