import { Controller, Get, Param, Query } from '@nestjs/common';
import { WatcherService } from './watcher.service';
import { WalletRepository } from '@app/common/wallet/wallet.repository';
import { Wallet } from '@prisma/client';
import {
  addressDTO,
  availableCoinsDTO,
  addressIdSchema,
  availableCoinsSchema,
} from './dtos';
import { ZodPipe } from './common/pipes/zodPipe';
import { TransactionsRepository } from '@app/common';

@Controller('balances/coins')
export class WatcherController {
  constructor(
    private readonly watcherService: WatcherService,
    private readonly walletRepository: WalletRepository,
    private readonly transactionsRepository: TransactionsRepository,
  ) {}

  @Get()
  async getHello(): Promise<Wallet> {
    return this.walletRepository.checkWalletExistence(
      'erd1qqqqqqqqqqqqqpgq9nnx7n40snv899ejwcrtepc5qn6apxvm2jps88s0v7',
    );
  }

  // @Get(':coin/received')
  // async signIn(@Param() signInParams: RetrieveAmountsDTO) {
  //   return signInParams;
  // }

  @Get(':coin/received')
  async test(
    @Param(new ZodPipe(availableCoinsSchema)) { coin }: availableCoinsDTO,
    @Query(new ZodPipe(addressIdSchema)) { addressId }: addressDTO,
  ) {
    return this.transactionsRepository.getWalletSentAmount(addressId, coin);
  }
}
