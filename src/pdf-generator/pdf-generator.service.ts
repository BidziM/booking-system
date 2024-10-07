import { Injectable } from '@nestjs/common';
import pdf from 'html-pdf';
import fs from 'fs';
import path from 'path';
import Handlebars from 'handlebars';
import puppeteer from 'puppeteer';
import { Ticket } from './entity/pdf.entity';
//import image from '../dev/odoriko.png';
@Injectable()
export class PdfGeneratorService {
  async generatePdf(Tickets: Ticket[]): Promise<Buffer> {
    const filename = path.resolve(__dirname, './templates/confirmation.hbs');
    const template = fs.readFileSync(filename, 'utf8');
    const temp = Handlebars.compile(template);
    const html = [];
    Tickets.forEach((data) => {
      const newTemp = temp({
        date: data.date,
        time: data.time,
        performanceName: data.performanceName,
        row: data.row,
        placment: data.placment,
        seat: data.seat,
        price: data.price / 100,
      });
      html.push(newTemp);
    });
    const browser = await puppeteer.launch({
      args: ['--no-sandbox'],
      headless: true,
    });

    const page = await browser.newPage();
    //Change comma in array to breakline
    html.unshift(
      `<div style='display: flex; flex-direction:row; flex-wrap: wrap; justify-content: center; margin:24px auto';>`,
    );
    html.push('</div>');
    await page.goto(
      `data:text/html;charset=UTF-8,${html.join(
        '<div style="height:6px;"><br></div>',
      )}`,
      {
        waitUntil: 'networkidle0',
      },
    );

    const newPdf = await page.pdf({
      format: 'A4',
      scale: 0.4,
      margin: {
        top: 30,
      },
    });
    //await page.pdf({ path: __dirname + '/tickets', format: 'A4', scale: 0.4 });
    await browser.close();
    return newPdf;
  }
}
