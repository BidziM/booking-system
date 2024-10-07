import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ValidationPipe,
  UsePipes,
  HttpStatus,
  HttpCode,
  Res,
} from '@nestjs/common';
import { PdfGeneratorService } from './pdf-generator.service';

@Controller('test')
export class PdfController {
  constructor(private readonly performanceService: PdfGeneratorService) {}
  @Get()
  create() {
    return; //this.performanceService.generatePdf();
  }
}
