import { Transactions } from '@prisma/client';

export interface TransactionExtended extends Transactions {
  coin: string;
  decodedData: string;
}
