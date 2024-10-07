import axios, { AxiosInstance } from 'axios';
import { SuccessResponse, ErrorResponse } from 'src/response';
import { calculateSHA384 } from '../hash';
import {
  ProductionUrl,
  SandboxUrl,
  EndpointTransactionRegister,
  EndpointTransactionRequest,
  ServerConfirmedTransaction,
  EndpointTransactionVerify,
  EndpointTransactionVerifBySessionId,
} from './endpoints';
import {
  TransactionClass,
  Transaction,
  Order,
  OrderCreatedData,
  Verification,
  VerificationData,
  VerifyBySession,
} from './transaction.interface';
import { P24Error } from '@ingameltd/node-przelewy24';
import { validIps } from './przelewy_IP';
import { env } from 'process';

type BaseParameters = {
  merchantId: number;
  posId: number;
};

export class Przelewy24 implements TransactionClass {
  private merchantId: number;
  private posId: number;
  private crcKey: string;
  private apiKey: string;
  private client: AxiosInstance;
  private baseUrl: string;
  private urlStatus: string;
  private baseParameters: BaseParameters;
  private options: {
    sandbox: boolean;
  };
  /**
   * Creates an instance of Przelewy24.
   * @param {number} merchantId Merchant ID given by Przelewy24
   * @param {number} posId Shop ID (defaults to merchantId)
   * @param {string} apiKey API Key from P24 panel(Klucz do raportów)
   * @param {string} crcKey CRC key from P24 panel
   * @param {P24Options} [options={ sandbox: false }] - additional options
   * @memberof Przelewy24
   **/
  constructor(
    merchantId: number,
    posId: number,
    apiKey: string,
    crcKey: string,
    options = { sandbox: env.NODE_ENV === 'production' ? false : true },
  ) {
    this.merchantId = merchantId;
    this.posId = posId;
    this.crcKey = crcKey;
    this.apiKey = apiKey;
    this.options = options;
    if (!this.posId) this.posId = this.merchantId;
    this.baseUrl = this.options.sandbox ? SandboxUrl : ProductionUrl;
    this.urlStatus = ServerConfirmedTransaction;

    this.baseParameters = {
      merchantId: this.merchantId,
      posId: this.posId,
    };

    this.client = axios.create({
      baseURL: `${this.baseUrl}/api/v1`,
      auth: {
        username: posId.toString(),
        password: this.apiKey,
      },
    });
  }
  /**
   * Creates a transaction
   *
   * @param {Order} order - order to be created
   * @returns {Promise<Transaction>}
   * @throws {P24Error}
   * @memberof P24
   */
  public async createTransaction(order: Order): Promise<Transaction> {
    try {
      const hashData = {
        sessionId: order.sessionId,
        merchantId: this.baseParameters.merchantId,
        amount: order.amount,
        currency: order.currency,
        crc: this.crcKey,
      };
      const sign = calculateSHA384(JSON.stringify(hashData));

      const orderData = {
        ...this.baseParameters,
        ...order,
        sign,
      };
      const { data } = await this.client.post(
        EndpointTransactionRegister,
        orderData,
      );
      const response = <SuccessResponse<OrderCreatedData>>data;
      console.log(response.data);
      const transaction: Transaction = {
        token: response.data.token,
        link: `${this.baseUrl}${EndpointTransactionRequest}/${response.data.token}`,
      };

      return transaction;
    } catch (error) {
      if (error.response && error.response.data) {
        const resp = <ErrorResponse<string>>error.response.data;
        throw new P24Error(resp.error, resp.code);
      }
      throw new P24Error(`Unknown Error ${error}`, -1);
    }
  }
  /**
   * Verify transaction
   *
   * @param {Verification} verification - verification request
   * @returns {Promise<boolean>}
   * @throws {P24Error}
   * @memberof P24
   */
  public async verifyTransaction(verification: Verification): Promise<boolean> {
    try {
      const hashData = {
        sessionId: verification.sessionId,
        orderId: verification.orderId,
        amount: verification.amount,
        currency: verification.currency,
        crc: this.crcKey,
      };

      const sign = calculateSHA384(JSON.stringify(hashData));
      const verificationData: Verification & { sign: string } = {
        ...this.baseParameters,
        sessionId: verification.sessionId,
        amount: verification.amount,
        currency: verification.currency,
        orderId: verification.orderId,
        sign,
      };
      const { data } = await this.client.put(
        EndpointTransactionVerify,
        verificationData,
      );
      const result = <SuccessResponse<VerificationData>>data;
      return result.data.status === 'success';
    } catch (error) {
      if (error.response && error.response.data) {
        const resp = <ErrorResponse<string>>error.response.data;
        console.log(error.response);
        throw new P24Error(resp.error, resp.code);
      }
      throw new P24Error(`Unknown Error ${error}`, -1);
    }
  }
  public async verifyTransactionBySessionId(
    sessionId: string,
  ): Promise<VerifyBySession> {
    try {
      const result = await this.client.get(
        `${EndpointTransactionVerifBySessionId}/${sessionId}`,
      );
      return result.data.data;
    } catch (error) {
      if (error.response.status === 404) {
        return {
          status: 0,
        };
      }
      if (error.response && error.response.data) {
        const resp = <ErrorResponse<string>>error.response.data;
        throw new P24Error(resp.error, resp.code);
      }
      throw new P24Error(`Unknown Error ${error}`, -1);
    }
  }
  /**
   * Validates IP with P24 backends
   *
   * @static
   * @param {string} ip - IP Address
   * @returns {boolean} - true on validated ip
   * @memberof Przelewy24
   */
  public static isIpValid(ip: string): boolean {
    return validIps.includes(ip);
  }
}
