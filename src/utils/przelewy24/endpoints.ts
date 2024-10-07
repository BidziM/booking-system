import { env } from 'process';

export const ProductionUrl = 'https://secure.przelewy24.pl';
export const SandboxUrl = 'https://sandbox.przelewy24.pl';
export const ServerConfirmedTransaction =
  env.SERVER_API_URI_CONFIRMED_TRANSACTION;

export const EndpointTestAccess = '/testAccess';
export const EndpointTransactionRegister = '/transaction/register/ttl';
export const EndpointTransactionRequest = '/trnRequest';
export const EndpointTransactionVerify = '/transaction/verify';
export const EndpointRefund = '/transaction/refund';
export const EndpointTransactionVerifBySessionId = '/transaction/by/sessionId';
