import {
  Controller,
  UseGuards,
  Post,
  Get,
  Body,
  Patch,
  Res,
  Req,
  Param,
  Delete,
  ValidationPipe,
  UsePipes,
  BadRequestException,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { Verification } from 'src/utils/przelewy24/transaction.interface';
import { Seats } from '@prisma/client';
import { Response, Request } from 'express';

@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post(':uniqueUrl')
  @UsePipes(ValidationPipe)
  async create(
    @Param('uniqueUrl') uniqueUrl: string,
    @Res() res: Response,
    @Req() req: Request,
    @Body() createBookingDto: CreateBookingDto,
  ) {
    if (!req.user && !req.body.email) throw new BadRequestException();
    const data = await this.bookingService.create(
      uniqueUrl,
      createBookingDto,
      req.user,
    );
    if (req.user) return res.status(200).end(); //res.status(200).json();
    if (data instanceof Object) {
      return res.status(200).json({ paymentGatway: data.paymentGateway });
    }
  }

  @Get(':url')
  findOne(@Param('url') url: string) {
    return this.bookingService.findBookedSeats(url);
  }

  @Post('verification/urlStatus')
  Transaction(@Body() verification: Verification) {
    return this.bookingService.verifyTransaction(verification);
  }

  @Post('tickets/price/:uniqueUrl')
  @UsePipes(ValidationPipe)
  getTicketsPrice(
    @Param('uniqueUrl') uniqueUrl: string,
    @Body() selectedSeats: Seats[],
  ) {
    return this.bookingService.getTicketsPrice(uniqueUrl, selectedSeats);
  }

  // @Get(':sessionId')
  // findOne(@Param('sessionId') sessionId: string) {
  //   return this.bookingService.findOne(sessionId);
  // }

  // @Post('book/admin')
  // @UseGuards(AuthenticatedGuard)
  // @UsePipes(ValidationPipe)
  // bookSeatsByAdmin(@Body() createBookingDto: CreateBookingDto) {
  //   return this.bookingService.bookByAdmin(createBookingDto);
}
