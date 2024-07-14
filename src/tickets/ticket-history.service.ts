// src/tickets/ticket-history.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TicketHistory } from './entities/ticket-history.entity';

@Injectable()
export class TicketHistoryService {
  constructor(
    @InjectRepository(TicketHistory)
    private historyRepository: Repository<TicketHistory>,
  ) {}

  async logChange(ticketID: number, changeType: string, oldValue: string, newValue: string): Promise<TicketHistory> {
    const history = this.historyRepository.create({
      ticketID,
      changeType,
      oldValue,
      newValue,
      changeDate: new Date(),
    });

    return this.historyRepository.save(history);
  }

  async getTicketHistory(ticketID: number): Promise<TicketHistory[]> {
    return this.historyRepository.find({ where: { ticketID } });
  }
}
