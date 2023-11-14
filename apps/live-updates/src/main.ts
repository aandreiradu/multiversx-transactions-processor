import { NestFactory } from '@nestjs/core';
import { LiveUpdatesModule } from './live-updates.module';
import { RmqService } from '@app/common/rmq/rmq.service';
import { ServiceWorkersService } from './service-workers/service-workers.service';

async function bootstrap() {
  const app = await NestFactory.create(LiveUpdatesModule);
  const rmqService = app.get<RmqService>(RmqService);
  const serviceWorkers = app.get<ServiceWorkersService>(ServiceWorkersService);

  app.connectMicroservice(rmqService.getOptions('MVX_TRANSACTIONS'));
  app.connectMicroservice(serviceWorkers.handleTransactions());
  await app.startAllMicroservices();
  console.log(`Live-updates started`);
}
bootstrap();
