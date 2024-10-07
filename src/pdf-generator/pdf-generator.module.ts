import { Module } from '@nestjs/common';
import { PdfGeneratorService } from './pdf-generator.service';
import { PdfController } from './pdf.controller';
@Module({
  controllers: [PdfController],
  providers: [PdfGeneratorService],
  exports: [PdfGeneratorService],
})
export class PdfGeneratorModule {}
