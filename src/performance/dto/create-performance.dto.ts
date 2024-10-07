import {
  IsNotEmpty,
  IsDateString,
  Length,
  IsNumberString,
  IsEnum,
  ArrayNotEmpty,
  IsString,
} from 'class-validator';

import { ComapnyName } from '@prisma/client';

export class CreatePerformanceDto {
  @IsNotEmpty()
  @Length(3)
  @IsString()
  name: string;

  //@IsNotEmpty()
  description: string;

  @IsNotEmpty()
  @IsDateString()
  date: string;

  @IsNotEmpty()
  @ArrayNotEmpty()
  time: string[];

  @IsNotEmpty()
  datePublic: Date;

  @IsNotEmpty()
  seatZoneData: {
    [key: string]: string;
  };

  @IsNotEmpty()
  @IsEnum(ComapnyName)
  companyName: ComapnyName;
}
