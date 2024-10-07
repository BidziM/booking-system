import { IsNotEmpty, IsEmail, IsArray, ValidateIf } from 'class-validator';
import { Seats } from '@prisma/client';

export class CreateBookingDto {
  @IsNotEmpty()
  @IsArray()
  selectedSeats: Seats[];

  @ValidateIf((o) => o.email)
  @IsNotEmpty()
  @IsEmail()
  email?: string;
}
