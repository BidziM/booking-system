import { PartialType } from '@nestjs/mapped-types';
import { CreatePerformanceDto } from './create-performance.dto';
import { IsNotEmpty, IsDateString, ValidateIf } from 'class-validator';

export class DeletePerformanceDto {
  @IsNotEmpty()
  name: string;
  @IsNotEmpty()
  @IsDateString()
  date: string;
}
