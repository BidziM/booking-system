import { IsNotEmpty, IsString, validate } from 'class-validator';
import { UpdatePerformanceDto } from './update-performance.dto';
import { IntersectionType } from '@nestjs/mapped-types';

export class PreDto {
  @IsNotEmpty()
  @IsString()
  contentType: string;

  @IsNotEmpty()
  @IsString()
  filePath: string;
}

export class PresignedDto extends IntersectionType(
  UpdatePerformanceDto,
  PreDto,
) {}
