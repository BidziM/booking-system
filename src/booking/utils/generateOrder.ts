import { env } from 'process';
import {
  Currency,
  Country,
  Language,
  Encoding,
} from 'src/utils/przelewy24/enums';

/**
 * Generate order for przelewy24
 * @param {number} price Price for tickets
 **/
export const generateOrder = (
  price: number,
  sessionId: string,
  email: string,
  urlStatus: string,
  urlReturn: string,
) => {
  return {
    sessionId,
    amount: price, // Transaction amount expressed in lowest currency unit, e.g. 1.23 PLN = 123
    currency: Currency.PLN,
    description: 'Bilety na spektakl',
    email,
    country: Country.Poland,
    language: Language.PL,
    urlStatus, // callback to get notification
    urlReturn, //Rerutn to website
    timeLimit: Number(env.PAYMENT_EXPIRE ? env.PAYMENT_EXPIRE : '15'),
    encoding: Encoding.UTF8,
    ttl: Number(env.PAYMENT_EXPIRE ? env.PAYMENT_EXPIRE : '15'),
  };
};
