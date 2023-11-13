import { Module } from '@nestjs/common';
import { ServiceWorkersService } from './service-workers.service';
import { ScheduleModule } from '@nestjs/schedule';
import { RmqModule } from '@app/common';
import { TRANSACTIONS_SERVICE } from '../../../../libs/common/constants/services';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    RmqModule.register({
      name: TRANSACTIONS_SERVICE,
    }),
  ],
  providers: [ServiceWorkersService],
  exports: [ServiceWorkersService],
})
export class ServiceWorkersModule {}
