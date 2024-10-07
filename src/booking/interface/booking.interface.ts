import { Performances, Seats } from '@prisma/client';

export interface Seat extends Seats {
  zone: { price: number };
}

export interface EmailProducer {
  email: string;
  seats: Seat[];
  performance: Performances;
  sessionId?: string;
}
