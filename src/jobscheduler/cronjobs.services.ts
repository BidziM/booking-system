import { BookingStatus, SeatJobCroneStatus } from '@prisma/client';
import {
  LoggerEventStatus,
  LoggerService,
  LoggerType,
} from 'src/logger/logger.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { getCompanyData } from 'src/utils/przelewy24/getCompanyDataForPayment';
import { Przelewy24 } from 'src/utils/przelewy24/przelewy24';
export class CronJobs {
  constructor(private prisma: PrismaService, private logger: LoggerService) {}
  async fetchTasksFromDB() {
    const a = await this.prisma.seatCronJob.findMany({
      where: { status: SeatJobCroneStatus.WATING },
    });
    return a;
  }
  async UnlockSeats(transactionId: number) {
    console.log('seat unlocked');
    const transactionData = await this.prisma.transactions.findUnique({
      where: { id: transactionId },
      include: {
        seats: true,
        performance: {
          select: {
            companyName: true,
          },
        },
      },
    });
    if (transactionData.verified === false) {
      const companyData = getCompanyData(
        transactionData.performance.companyName,
      );
      const paymentGate = new Przelewy24(
        companyData.merchantId,
        companyData.posId,
        companyData.apiKey,
        companyData.crcKey,
      );
      const session = await paymentGate.verifyTransactionBySessionId(
        transactionData.sessionId,
      );
      if (session.status === 1 || session.status === 2)
        transactionData.verified = true;
    }

    if (
      transactionData.seats.length > 0 &&
      transactionData.status === 'WATING' &&
      transactionData.verified === false
    ) {
      const seatsToUpdate = [];
      transactionData.seats.forEach((seat) => {
        if (seat.status === BookingStatus.BOOKED) {
          seatsToUpdate.push(seat);
        }
      });
      if (seatsToUpdate.length > 0) {
        await this.prisma.seats.updateMany({
          where: {
            id: { in: seatsToUpdate.map((s) => s.id) },
            transactionId: transactionId,
          },
          data: {
            status: BookingStatus.AVAILABLE,
            transactionId: null,
          },
        });
      }
      this.logger.addLog(LoggerType.FAIL_BUY, {
        email: transactionData.email,
        status: LoggerEventStatus.REMOVED_BY_CRONE,
        sessionId: transactionData.sessionId,
      });
    }

    await this.prisma.seatCronJob.delete({
      where: {
        transactionId: transactionId,
      },
    });
  }
}
