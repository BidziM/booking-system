import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import {
  Transactions,
  BookingStatus,
  Prisma,
  Seats,
  Performances,
} from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { JobschedulerService } from 'src/jobscheduler/jobscheduler.service';
import { generateOrder } from './utils/generateOrder';
import { Przelewy24 } from 'src/utils/przelewy24/przelewy24';
import { uuid } from 'uuidv4';
import { MessageProducer } from '../sqs/producer.service';
import { getCompanyData } from '../utils/przelewy24/getCompanyDataForPayment';
import {
  Verification,
  Order,
} from 'src/utils/przelewy24/transaction.interface';
import { env } from 'process';
import { EmailProducer, Seat } from './interface/booking.interface';
import { translatePlace } from './utils/translatePlace';
import {
  LoggerEventStatus,
  LoggerService,
  LoggerType,
  LogStatus,
} from 'src/logger/logger.service';

@Injectable()
export class BookingService {
  constructor(
    private prisma: PrismaService,
    private readonly messageProducer: MessageProducer,
    private logger: LoggerService,
  ) {}

  @Inject(JobschedulerService)
  private readonly jobScheduler: JobschedulerService;

  getPaymentGate(data) {
    return new Przelewy24(
      data.merchantId,
      data.posId,
      data.apiKey,
      data.crcKey,
    );
  }

  async create(
    uniqueUrl: string,
    data: CreateBookingDto,
    user,
  ): Promise<Transactions | void> {
    const performance = await this.prisma.performances.findFirst({
      where: {
        uniqueUrl: uniqueUrl,
      },
      include: {
        SeatZoneForPerformances: true,
      },
    });

    if (!performance)
      throw new NotFoundException('Can not find a performance with this id');

    const urlPayment = await this.prisma.$transaction(
      async (tx) => {
        let seats = await this.prisma.seats.findMany({
          where: {
            performanceId: performance.id,
            OR: data.selectedSeats,
          },
        });
        if (seats.length === 0) throw new ConflictException('No selected seat');
        const zones = await tx.seatZone.findMany({
          where: {
            id: {
              in: performance.SeatZoneForPerformances.map((a) => a.seatZoneId),
            },
          },
        });

        let price = 0;

        seats = seats.map((seat) => {
          let singelSeat;
          if (seat.status !== BookingStatus.AVAILABLE) {
            throw new ConflictException(
              'One of selected seats is already booked try with another seats',
            );
          }

          zones.forEach((z) => {
            if (z.id === seat.zoneId) {
              price = price + z.price;
              singelSeat = { ...seat, zone: { price: z.price } };
            }
          });
          return singelSeat;
        });

        if (user) {
          const countSeat = await tx.seats.updateMany({
            where: {
              id: { in: seats.map((s) => s.id) },
              status: BookingStatus.AVAILABLE,
            },
            data: {
              status: BookingStatus.BOOKED_BY_ADMINISTRATOR,
            },
          });
          if (countSeat.count !== seats.length)
            throw new ConflictException(
              'One of selected seats is already booked try with another seats',
            );
          await this.bookByAdmin(performance, seats as Seat[], user.email);
          console.log('booked by admin');
          return;
        }

        if (price === 0) {
          throw new ConflictException('Price can not be 0');
        }

        const przelewyConfig = getCompanyData(performance.companyName);

        /**
         * SessionId is unique id for transaction
         *
         * @type {string}
         */
        const sessionId = uuid();
        const order: Order = generateOrder(
          price,
          sessionId,
          data.email,
          env.SERVER_API_URI_CONFIRMED_TRANSACTION,
          env.SERVER_URI_RETURN,
        );
        const payment = new Przelewy24(
          przelewyConfig.merchantId,
          przelewyConfig.posId,
          przelewyConfig.apiKey,
          przelewyConfig.crcKey,
        );

        const gatewayData = await payment.createTransaction(order);

        const createdTransaction = await tx.transactions.create({
          data: {
            price: price,
            email: data.email,
            sessionId: sessionId,
            performanceId: performance.id,
            paymentGateway: gatewayData.link,
          },
        });

        const countSeats = await tx.seats.updateMany({
          where: {
            id: { in: seats.map((s) => s.id) },
            status: BookingStatus.AVAILABLE,
          },
          data: {
            status: BookingStatus.BOOKED,
            transactionId: createdTransaction.id,
          },
        });

        if (countSeats.count !== seats.length)
          throw new ConflictException(
            'One of selected seats is already booked try with another seats',
          );

        const cronTimerToExecute = env.PAYMENT_EXPIRE
          ? env.PAYMENT_EXPIRE
          : '15';
        const cronData = await tx.seatCronJob.create({
          data: {
            transactionId: createdTransaction.id,
            dateToExecute: new Date(
              +new Date() + 1000 * 60 * (Number(cronTimerToExecute) + 1),
            ).toISOString(),
            type: 'UNLOCK_SEAT',
          },
        });

        await this.jobScheduler.addCronTask(cronData);
        this.logger.addLog(LoggerType.RESERVATION, {
          email: data.email,
          status: LogStatus.USER_RESERVATION,
          seatsArray: seats.map((seat) => ({
            row: seat.row,
            seat: seat.seat,
            placement: seat.placement,
          })),
          spectacleUrl: uniqueUrl,
          price: price,
          sessionId: sessionId,
        });
        return createdTransaction;
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
        maxWait: 15000,
        timeout: 15000,
      },
    );

    return urlPayment;
  }

  async bookByAdmin(perfromance: Performances, seats: Seat[], email: string) {
    const emailData: EmailProducer = {
      email: email,
      seats: seats,
      performance: perfromance,
    };
    await this.confirmTransaction(emailData);
    this.logger.addLog(LoggerType.RESERVATION, {
      email: email,
      status: LogStatus.ADMIN_RESERVATION,
      seatsArray: seats.map((seat) => ({
        row: seat.row,
        seat: seat.seat,
        placement: seat.placement,
      })),
      spectacleUrl: perfromance.uniqueUrl,
    });
    return;
  }

  async verifyTransaction(data: Verification) {
    try {
      const transactionData = await this.prisma.transactions.findFirst({
        where: {
          sessionId: data.sessionId,
        },
        include: {
          performance: true,
          seats: {
            include: {
              zone: {
                select: {
                  price: true,
                },
              },
            },
          },
        },
      });
      const przelewyConfig = getCompanyData(
        transactionData.performance.companyName,
      );

      console.log(transactionData.seats);

      const paymentGate = new Przelewy24(
        przelewyConfig.merchantId,
        przelewyConfig.posId,
        przelewyConfig.apiKey,
        przelewyConfig.crcKey,
      );
      const verifyTransaction = await paymentGate.verifyTransaction(data);
      if (verifyTransaction) {
        await this.prisma.transactions.update({
          where: {
            id: transactionData.id,
          },
          data: {
            verified: true,
          },
        });
        const emailData: EmailProducer = {
          email: transactionData.email,
          seats: transactionData.seats,
          performance: transactionData.performance,
          sessionId: transactionData.sessionId,
        };
        await this.confirmTransaction(emailData);
        this.logger.addLog(LoggerType.RESERVATION, {
          email: transactionData.email,
          status: LoggerEventStatus.OK,
          sessionId: transactionData.sessionId,
        });
      }
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException();
    }
  }

  async getTransactionStatus(sessionId: string): Promise<boolean> {
    const transaction = await this.prisma.transactions.findFirst({
      where: { sessionId },
      include: {
        performance: {
          select: {
            companyName: true,
          },
        },
      },
    });
    if (transaction.verified) {
      return true;
    }
    const przelewyConfig = getCompanyData(transaction.performance.companyName);
    const gate = new Przelewy24(
      przelewyConfig.merchantId,
      przelewyConfig.posId,
      przelewyConfig.apiKey,
      przelewyConfig.crcKey,
    );
    const data = await gate.verifyTransactionBySessionId(sessionId);
    return !!data.status;
  }

  async confirmTransaction(emailData: EmailProducer) {
    await this.messageProducer.sendEmailToQueue(
      emailData.email,
      emailData.seats.map((data) => ({
        date: emailData.performance.date.toISOString().substring(0, 10),
        time: emailData.performance.time,
        performanceName: emailData.performance.name,
        row: data.row,
        seat: data.seat,
        placment: translatePlace(data.placement),
        price: data.zone.price,
      })),
      emailData?.sessionId,
    );
    return;
  }

  async getTicketsPrice(uniqueUrl: string, selectedSeats: Seats[]) {
    const Price = await this.prisma.seats.findMany({
      where: {
        performance: {
          uniqueUrl: uniqueUrl,
        },
        OR: selectedSeats,
      },
      include: {
        zone: true,
      },
    });
    return Price.reduce((acc, cur) => acc + cur.zone.price, 0);
  }

  async findBookedSeats(url: string) {
    await this.prisma.performances.findFirstOrThrow({
      where: { uniqueUrl: url },
    });
    return this.prisma.seats.findMany({
      where: {
        performance: {
          uniqueUrl: url,
        },
        status: {
          not: BookingStatus.AVAILABLE,
        },
      },
    });
  }
}
