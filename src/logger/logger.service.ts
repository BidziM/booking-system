import { Injectable, OnModuleInit } from '@nestjs/common';
import winston, { format } from 'winston';
export { LogStatus, LoggerEventStatus } from './StatusEnum';

export interface emaiLog {
  meassage?: string;
  email: string;
  status?: string;
  seatsArray?: {
    seat: number;
    row: number;
    placement: string;
  }[];
  price?: number;
  spectacleUrl?: number | string;
  sessionId?: number | string;
  gateway?: string;
}

const formatD = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  // winston.format.printf(
  //   (info: winston.Logform.TransformableInfo & emaiLog) =>
  //     `[${info.timestamp}] ${info.message} ${info.custom} `,
  //,
  winston.format.json(),
);
class CreateWinstonFactory {
  public createLogger(name: string) {
    return winston.createLogger({
      level: 'info',
      transports: [
        new winston.transports.File({
          filename: `logs/${name}.log`,
          format: formatD,
        }),
      ],
    });
  }
}

export enum LoggerType {
  SUCCESS_BUY,
  FAIL_BUY,
  RESERVATION,
}
@Injectable()
export class LoggerService {
  private successBuy;
  private failBuy;
  private reservation;
  constructor() {
    const logger = new CreateWinstonFactory();
    this.successBuy = logger.createLogger('successBuy');
    this.failBuy = logger.createLogger('failBuy');
    this.reservation = logger.createLogger('reservation');
  }

  public addLog(name: LoggerType, message: emaiLog) {
    switch (name) {
      case LoggerType.SUCCESS_BUY:
        // code block
        this.successBuy.log('info', { ...message });
        break;
      case LoggerType.FAIL_BUY:
        this.failBuy.log('info', { ...message });
        // code block
        break;
      case LoggerType.RESERVATION:
        console.log('reservation');
        this.reservation.log('info', { ...message });
        // code block
        break;
    }
  }
}
