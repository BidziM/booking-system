import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PerformanceModule } from './performance/performance.module';
import { BookingModule } from './booking/booking.module';
import { JobschedulerModule } from './jobscheduler/jobscheduler.module';
import { MailModule } from './mail/mail.module';
import { PdfGeneratorModule } from './pdf-generator/pdf-generator.module';
import { ProducerModule } from './sqs/producer.module';
import { ConsumerModule } from './sqs/consumer.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { S3Service } from './services/s3/s3.service';
import { LoggerModule } from './logger/logger.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    PerformanceModule,
    BookingModule,
    JobschedulerModule,
    MailModule,
    PdfGeneratorModule,
    ProducerModule,
    ConsumerModule,
    AuthModule,
    PrismaModule,
    LoggerModule,
  ],
  providers: [S3Service],
})
export class AppModule {}
