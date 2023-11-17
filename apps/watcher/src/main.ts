import { NestFactory } from '@nestjs/core';
import { WatcherModule } from './watcher.module';
import { ZodFilter } from './common/filters/zodFIlter';

async function bootstrap() {
  const app = await NestFactory.create(WatcherModule);
  app.enableShutdownHooks();
  app.useGlobalFilters(new ZodFilter());
}
bootstrap();
