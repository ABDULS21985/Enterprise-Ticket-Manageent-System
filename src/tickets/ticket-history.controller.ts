// src/tickets/ticket-history.controller.ts

import { Controller, Get, Param } from '@nestjs/common';
import { TicketHistoryService } from './ticket-history.service';
import { TicketHistory } from './entities/ticket-history.entity';

@Controller('tickets/:ticketID/history')
export class TicketHistoryController {
  constructor(private readonly ticketHistoryService: TicketHistoryService) {}

  @Get()
  async getTicketHistory(@Param('ticketID') ticketID: number): Promise<TicketHistory[]> {
    return this.ticketHistoryService.getTicketHistory(ticketID);
  }
}
