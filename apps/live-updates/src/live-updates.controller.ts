import { Controller, Logger } from '@nestjs/common';
import { LiveUpdatesService } from './live-updates.service';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { RmqService } from '@app/common';
import { Transactions } from '@prisma/client';

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
      if (data) {
        const payload = JSON.parse(data) as Transactions;
        await this.liveUpdatesService.processTransaction(payload);
        this.rmqService.ack(context);
      }
    } catch (error) {
      this.logger.error(
        `Error CONSUMER TRANSACTIONS => ${JSON.stringify(data)}`,
      );
      this.logger.error(error);
      /*
        Move the message to a DLQ or Requeq with exp. backoff
      */
      this.rmqService.ack(context);
      return;
    }
  }
}
