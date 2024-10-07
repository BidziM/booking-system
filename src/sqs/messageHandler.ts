import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SqsMessageHandler } from '@ssut/nestjs-sqs';
import { MailService } from 'src/mail/mail.service';
import * as AWS from 'aws-sdk';
import { env } from 'process';

@Injectable()
export class MessageHandler {
  constructor(private mailerService: MailService) {}
  @SqsMessageHandler(env.EMAIL_QUEUE, false)
  async emailHandler(message: AWS.SQS.Message) {
    try {
      const obj: any = JSON.parse(message.Body) as {
        message: string;
        date: string;
      };
      const data = obj.Message;
      await this.mailerService.sendUserConfirmation(data);
      return;
      // use the data and consume it the way you want //
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException(e);
    }
  }
}
