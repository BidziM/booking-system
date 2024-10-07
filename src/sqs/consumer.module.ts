import { Module } from '@nestjs/common';
import { SqsModule } from '@ssut/nestjs-sqs';
import * as AWS from 'aws-sdk';
import { env } from 'process';
import { MessageHandler } from './messageHandler';
import { MailModule } from 'src/mail/mail.module';

AWS.config.update({
  region: env.AWS_REGION,
  accessKeyId: env.ACCESS_KEY_ID,
  secretAccessKey: env.SECRET_ACCESS_KEY,
});
@Module({
  imports: [
    SqsModule.register({
      consumers: [
        {
          name: env.EMAIL_QUEUE, // name of the queue
          queueUrl: env.EMAIL_QUEUE_URL, // the url of the queue
          region: env.AWS_REGION,
        },
      ],
      producers: [],
    }),
    MailModule,
  ],
  controllers: [],
  providers: [MessageHandler],
})
export class ConsumerModule {}
