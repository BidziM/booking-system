import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreatePerformanceDto } from './dto/create-performance.dto';
import { UpdatePerformanceDto } from './dto/update-performance.dto';
import { Performances, Prisma, BookingStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { generateSeats } from './utils/generateSeats';
import { generateSeatZone } from './utils/generateSeatZone';
import { SortPerformance } from './utils/sortPerformance';
import teatrPlan from '../../teatrPlan.json';

@Injectable()
export class PerformanceService {
  constructor(private prisma: PrismaService) {}

  async create(
    data: { time: string[] } & CreatePerformanceDto,
  ): Promise<Performances[]> {
    const checkIfExsit = await this.prisma.performances.findFirst({
      where: {
        name: data.name,
        date: data.date,
      },
    });
    if (checkIfExsit) {
      throw new ConflictException('Performance already exist');
    }
    const performance = await this.prisma.$transaction(
      async (tx) => {
        const performanceArray: Prisma.PerformancesCreateInput[] =
          data.time.map((t) => {
            const tempData = { ...data };
            delete tempData.seatZoneData;
            return {
              ...tempData,
              time: t,
            };
          });
        const generateZone = generateSeatZone(data.seatZoneData);

        const seatZone = await Promise.all(
          generateZone.map((p) => tx.seatZone.create({ data: p })),
        );

        const createPerformanceArray = await Promise.all(
          performanceArray.map((p) => tx.performances.create({ data: p })),
        );

        const relationPerformanceToZone = [];
        createPerformanceArray.forEach((p) => {
          seatZone.forEach((s) =>
            relationPerformanceToZone.push({
              performanceId: p.id,
              seatZoneId: s.id,
            }),
          );
        });
        await tx.seatZoneForPerformances.createMany({
          data: relationPerformanceToZone,
        });

        const allSeats = createPerformanceArray.map((p) =>
          generateSeats(teatrPlan, p.id, seatZone),
        );

        await Promise.all(
          allSeats.map((p) =>
            tx.seats.createMany({
              data: p,
            }),
          ),
        );

        return createPerformanceArray;
      },
      {
        maxWait: 10000,
        timeout: 20000,
      },
    );
    return performance;
  }

  async findAll(req) {
    const performanceArray = await this.prisma.performances.findMany({
      orderBy: [{ date: 'asc' }],
      where: {
        date: {
          gte: new Date().toISOString(),
        },
        datePublic: {
          ...(req.user ? {} : { lte: new Date().toISOString() }),
        },
      },
    });
    return SortPerformance(performanceArray);
  }

  async findOne(url: string) {
    const performance = await this.prisma.performances.findFirst({
      where: {
        uniqueUrl: url,
      },
      include: {
        SeatZoneForPerformances: {
          include: {
            seatZone: {
              select: {
                price: true,
                name: true,
              },
            },
          },
        },
      },
    });
    return {
      performance,
    };
  }

  async update(data: UpdatePerformanceDto) {
    const per = await this.prisma.performances.updateMany({
      where: {
        name: data.name,
        date: data.date,
      },
      data: {
        description: data.newDescription,
        imageUrl: data.newImage,
        datePublic: data.newPublicDate,
      },
    });
    if (per.count === 0) throw new NotFoundException();
    return;
  }

  async remove(body) {
    let error;
    const performanceData = await this.prisma.performances.findMany({
      where: { name: body.name, date: body.date },
      include: {
        transactions: true,
      },
    });

    if (performanceData.length === 0)
      throw new NotFoundException('Can not find a performance with this data');

    performanceData.forEach((singlePerformance) => {
      if (
        singlePerformance.transactions.length > 0 &&
        body.sureToDelete === false
      ) {
        error =
          'Tickets for this performance has been already bought by someone, are you sure to remove it?';
        return;
      }
    });
    if (error) return error;
    await this.prisma.performances.deleteMany({
      where: { id: { in: performanceData.map((p) => p.id) } },
    });

    return `Performances removed`;
  }

  getByNameAndData(data: { name: string; date: string }) {
    return this.prisma.performances.findFirst({
      where: {
        name: data.name,
        date: data.date,
      },
    });
  }
}
