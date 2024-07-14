// src/tickets/priority-escalation.service.ts

import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from './entities/ticket.entity';

@Injectable()
export class PriorityEscalationService {
  constructor(
    @InjectRepository(Ticket)
    private ticketsRepository: Repository<Ticket>,
  ) {}

  @Cron('0 0 * * *') // Run daily at midnight
  async escalatePriorities(): Promise<void> {
    const tickets = await this.ticketsRepository.find({
      where: { status: 'Open' },
    });

    const now = new Date();

    for (const ticket of tickets) {
      if (!ticket.lastEscalationDate) {
        ticket.lastEscalationDate = ticket.creationDate;
      }

      const timeSinceLastEscalation = now.getTime() - ticket.lastEscalationDate.getTime();
      const timeSinceCreation = now.getTime() - ticket.creationDate.getTime();

      // Escalate priority based on time since last escalation or creation
      if (timeSinceLastEscalation > 24 * 60 * 60 * 1000 || timeSinceCreation > 24 * 60 * 60 * 1000) {
        switch (ticket.priority) {
          case 'Low':
            ticket.priority = 'Medium';
            break;
          case 'Medium':
            ticket.priority = 'High';
            break;
          case 'High':
            ticket.priority = 'Urgent';
            break;
        }
        ticket.lastEscalationDate = now;
        await this.ticketsRepository.save(ticket);
      }
    }
  }
}
