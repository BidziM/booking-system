import { Module } from '@nestjs/common';
import { PerformanceService } from './performance.service';
import { PerformanceController } from './performance.controller';
import { PdfGeneratorModule } from '../pdf-generator/pdf-generator.module';
import { S3Service } from 'src/services/s3/s3.service';

@Module({
  controllers: [PerformanceController],
  providers: [PerformanceService, PdfGeneratorModule, S3Service],
})
export class PerformanceModule {}
