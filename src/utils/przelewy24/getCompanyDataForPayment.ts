import { env } from 'process';
import { ComapnyName } from '@prisma/client';
import { InternalServerErrorException } from '@nestjs/common';
export const getCompanyData = (
  companyName: ComapnyName,
): {
  merchantId: number;
  posId: number;
  apiKey: string;
  crcKey: string;
} => {
  if (companyName === 'ODORIKO') {
    return {
      merchantId: Number(env.ORDORIKO),
      posId: Number(env.ORDORIKO),
      apiKey: env.ORDORIKO_API_KEY,
      crcKey: env.ORDORIKO_CRC,
    };
  }
  if (companyName === 'ODORIKO_BIS') {
    return {
      merchantId: Number(env.ORDORIKO),
      posId: Number(env.ORDORIKO),
      apiKey: env.ORDORIKOBIS_API_KEY,
      crcKey: env.ORDORIKOBIS_CRC,
    };
  } else {
    throw new InternalServerErrorException('Company name is not selected');
  }
};
