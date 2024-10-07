import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { Email } from './entity/email.entity';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MailService {
  constructor(
    private mailerService: MailerService,
    private readonly prisma: PrismaService,
  ) {}

  async sendUserConfirmation(emailData: Email) {
    try {
      await this.mailerService.sendMail({
        to: emailData.email,
        subject: 'Bilety ORDORIKO',
        template: './confirmation.hbs', // `.hbs` extension is appended automatically
        context: {
          // ✏️ filling curly brackets with content
          //name: 'sdasdsa',
        },
        attachments: [
          {
            filename: 'Ticket.pdf',
            content: Buffer.from(emailData.pdf, 'base64'),
          },
        ],
      });
      console.log('email send');
      if (emailData.sessionId)
        await this.prisma.transactions.update({
          where: {
            sessionId: emailData.sessionId,
          },
          data: {
            emailDelivered: true,
          },
        });
    } catch (e) {
      console.log(e);
    }
  }
}
