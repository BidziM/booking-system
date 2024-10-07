import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { JobschedulerModule } from 'src/jobscheduler/jobscheduler.module';
import { ProducerModule } from 'src/sqs/producer.module';

@Module({
  controllers: [BookingController],
  providers: [BookingService],
  imports: [JobschedulerModule, ProducerModule],
})
export class BookingModule {}
