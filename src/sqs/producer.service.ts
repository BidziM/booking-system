import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SqsService } from '@ssut/nestjs-sqs';
import { PdfGeneratorService } from 'src/pdf-generator/pdf-generator.service';
import { Ticket } from 'src/pdf-generator/entity/pdf.entity';
import { Email } from '../mail/entity/email.entity';
import { env } from 'process';
import { uuid } from 'uuidv4';
import sizeof from 'object-sizeof';
@Injectable()
export class MessageProducer {
  constructor(
    private readonly sqsService: SqsService,
    private pdfGenerator: PdfGeneratorService,
  ) {}
  private async sendMessage(name: string, body: any) {
    try {
      await this.sqsService.send(name, {
        id: uuid(),
        body: {
          Message: body,
        },
      });
    } catch (error) {
      console.log('error in producing image!', error);
    }
  }

  public async sendEmailToQueue(
    userEmail: string,
    ticketArray: Ticket[],
    sessionId?: string,
  ) {
    try {
      const pdfStream = await this.pdfGenerator.generatePdf(ticketArray);
      const body: Email = {
        email: userEmail,
        pdf: pdfStream.toString('base64'),
        sessionId: sessionId,
      };

      console.log(sizeof(pdfStream));
      console.log(sizeof(pdfStream.toString('base64')));

      await this.sendMessage(env.EMAIL_QUEUE, body);
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }
}
