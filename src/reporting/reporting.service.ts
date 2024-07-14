// src/reporting/reporting.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from '../tickets/entities/ticket.entity';

@Injectable()
export class ReportingService {
  constructor(
    @InjectRepository(Ticket)
    private ticketsRepository: Repository<Ticket>,
  ) {}

  async getTicketStatistics() {
    const totalTickets = await this.ticketsRepository.count();
    const resolvedTickets = await this.ticketsRepository.count({ where: { status: 'Resolved' } });
    const openTickets = await this.ticketsRepository.count({ where: { status: 'Open' } });

    // Add more statistics as needed

    return {
      totalTickets,
      resolvedTickets,
      openTickets,
      // Add more statistics
    };
  }
}
