// src/tickets/ticket-escalation.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Ticket } from './entities/ticket.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MailerService } from '../mailer/mailer.service';

@Injectable()
export class TicketEscalationService {
  constructor(
    @InjectRepository(Ticket)
    private ticketsRepository: Repository<Ticket>,
    private mailerService: MailerService, // Inject MailerService
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async checkSLABreaches(): Promise<void> {
    const currentDate = new Date();
    const tickets = await this.ticketsRepository.find({
      where: {
        status: 'Open',
        slaDueDate: LessThan(currentDate),
      },
    });

    for (const ticket of tickets) {
      await this.notifyAgent(ticket.assignedAgent, `Ticket ${ticket.ticketID} has breached SLA`);
      await this.notifyCustomer(ticket.customerID, `Your ticket ${ticket.ticketID} has breached SLA`);
    }
  }

  private async notifyCustomer(customerID: string, message: string) {
    const email = `${customerID}@example.com`;
    await this.mailerService.sendMail(email, 'SLA Breach Notification', message);
  }

  private async notifyAgent(agentID: string, message: string) {
    const email = `${agentID}@example.com`;
    await this.mailerService.sendMail(email, 'SLA Breach Notification', message);
  }
}
