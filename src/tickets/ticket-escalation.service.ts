// src/tickets/ticket-escalation.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Ticket } from './entities/ticket.entity';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class TicketEscalationService {
  constructor(
    @InjectRepository(Ticket)
    private ticketsRepository: Repository<Ticket>,
  ) {}

  async escalateTickets(): Promise<void> {
    const tickets = await this.ticketsRepository.find({
      where: {
        status: 'Open',
        priority: 'High',
        creationDate: LessThan(new Date(new Date().getTime() - 24 * 60 * 60 * 1000)) // older than 24 hours
      },
    });

    for (const ticket of tickets) {
      ticket.priority = 'Urgent';
      await this.ticketsRepository.save(ticket);
      // Optionally, notify relevant parties about the escalation
    }
  }

  @Cron('0 0 * * *') // Runs every day at midnight
  async handleCron() {
    await this.escalateTickets();
  }
}
