// src/mailer/mailer.controller.ts

import { Controller, Post, Body } from '@nestjs/common';
import { MailerService } from './mailer.service';

@Controller('mailer')
export class MailerController {
  constructor(private readonly mailerService: MailerService) {}

  @Post('send')
  async sendMail(
    @Body('to') to: string,
    @Body('subject') subject: string,
    @Body('text') text: string,
  ) {
    return this.mailerService.sendMail(to, subject, text);
  }
}
