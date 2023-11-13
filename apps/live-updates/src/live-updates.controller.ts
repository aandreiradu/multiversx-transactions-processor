import { Controller, Logger } from '@nestjs/common';
import { LiveUpdatesService } from './live-updates.service';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { RmqService } from '@app/common';
import { TransactionExtended } from '@app/common/types';

@Controller()
export class LiveUpdatesController {
  private readonly logger: Logger = new Logger(LiveUpdatesController.name);
  constructor(
    private readonly liveUpdatesService: LiveUpdatesService,
    private readonly rmqService: RmqService,
  ) {}

  @EventPattern('process_transaction')
  async processTransaction(@Payload() data: any, @Ctx() context: RmqContext) {
    this.logger.log(`Consumer received message => ${data}`);
    try {
      const payload = JSON.parse(data) as TransactionExtended;
      this.logger.log(`Starting to process transaction => ${payload.txHash}`);
      await this.liveUpdatesService.processTransaction(
        data.transaction as TransactionExtended,
      );
      this.logger.log(
        `Processed successfully transaction => ${payload.txHash}`,
      );
      this.rmqService.ack(context);
    } catch (error) {
      this.logger.error(
        `Error CONSUMER TRANSACTIONS => ${JSON.stringify(error)}`,
      );

      /*
        Move the message to a DLQ or Requeq with Backoff
      */
      this.rmqService.nack(context);
      return;
    }
  }
}
