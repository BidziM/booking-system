import { Performances, Seats } from '@prisma/client';

export type Email = {
  email: string;
  pdf: any;
  sessionId: string;
  //performanceData: Pick<Performances, 'name' | 'date' | 'time'>;
  //seats: Pick<Seats, 'row' | 'seat' | 'placement'> & { price: number }[];
};
