import { PartialType } from '@nestjs/mapped-types';
import { CreatePerformanceDto } from './create-performance.dto';
import {
  IsNotEmpty,
  IsDateString,
  ValidateIf,
  IsString,
} from 'class-validator';

export class UpdatePerformanceDto {
  @IsNotEmpty()
  @IsString()
  public name: string;

  @IsNotEmpty()
  @IsDateString()
  public date: string;

  @ValidateIf((o) => o.newPublicDate)
  @IsString()
  @IsNotEmpty()
  newPublicDate?: string;

  @ValidateIf((o) => o.newDescription)
  @IsNotEmpty()
  @IsString()
  newDescription?: string;

  @ValidateIf((o) => o.newImage)
  @IsNotEmpty()
  @IsString()
  newImage?: string;
}
