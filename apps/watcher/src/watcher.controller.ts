import { Controller, Get, Param, Query } from '@nestjs/common';
import { WatcherService } from './watcher.service';
import {
  addressDTO,
  availableCoinsDTO,
  addressIdSchema,
  availableCoinsSchema,
} from './dtos';
import { ZodPipe } from './common/pipes/zodPipe';

@Controller('balances/coins')
export class WatcherController {
  constructor(private readonly watcherService: WatcherService) {}

  @Get(':coin/sent')
  async returnSentsAmounts(
    @Param(new ZodPipe(availableCoinsSchema)) { coin }: availableCoinsDTO,
    @Query(new ZodPipe(addressIdSchema)) { addressId }: addressDTO,
  ) {
    return {
      amountSent: await this.watcherService.getWalletAmountByCoin(
        addressId,
        coin,
        'sent',
      ),
    };
  }

  @Get(':coin/received')
  async returnReceivedAmounts(
    @Param(new ZodPipe(availableCoinsSchema)) { coin }: availableCoinsDTO,
    @Query(new ZodPipe(addressIdSchema)) { addressId }: addressDTO,
  ) {
    return {
      amountSent: await this.watcherService.getWalletAmountByCoin(
        addressId,
        coin,
        'received',
      ),
    };
  }
}
