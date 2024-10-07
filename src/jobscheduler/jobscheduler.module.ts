import { Module } from '@nestjs/common';
import { JobschedulerService } from './jobscheduler.service';
import { CronJobs } from './cronjobs.services';

@Module({
  providers: [JobschedulerService, CronJobs],
  exports: [JobschedulerService, CronJobs],
})
export class JobschedulerModule {}
