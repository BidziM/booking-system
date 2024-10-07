import { Module } from '@nestjs/common';
import { SqsModule } from '@ssut/nestjs-sqs';
import { MessageProducer } from './producer.service';
import * as AWS from 'aws-sdk';
import { env } from 'process';
import { PdfGeneratorModule } from 'src/pdf-generator/pdf-generator.module';

AWS.config.update({
  region: env.AWS_REGION, // aws region
  accessKeyId: env.ACCESS_KEY_ID, // aws access key id
  secretAccessKey: env.SECRET_ACCESS_KEY, // aws secret access key
});

@Module({
  imports: [
    SqsModule.register({
      consumers: [],
      producers: [
        {
          name: env.EMAIL_QUEUE, // name of the queue
          queueUrl: env.EMAIL_QUEUE_URL,
          region: env.AWS_REGION, // url of the queue
        },
      ],
    }),
    PdfGeneratorModule,
  ],
  controllers: [],
  providers: [MessageProducer],
  exports: [MessageProducer],
})
export class ProducerModule {}
