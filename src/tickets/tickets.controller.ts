// src/tickets/tickets.controller.ts

import { Controller, Post, Patch, Param, Body, Get, Query } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { Ticket } from './entities/ticket.entity';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  async createTicket(
    @Body('customerID') customerID: string,
    @Body('issueDescription') issueDescription: string,
    @Body('priority') priority: string,
  ): Promise<Ticket> {
    return this.ticketsService.createTicket(customerID, issueDescription, priority);
  }

  @Patch(':ticketID/assign')
  async assignTicket(
    @Param('ticketID') ticketID: number,
    @Body('agentID') agentID: string,
  ): Promise<Ticket> {
    return this.ticketsService.assignTicket(ticketID, agentID);
  }

  @Patch(':ticketID/status')
  async updateTicketStatus(
    @Param('ticketID') ticketID: number,
    @Body('status') status: string,
  ): Promise<Ticket> {
    return this.ticketsService.updateTicketStatus(ticketID, status);
  }

  @Patch(':ticketID/close')
  async closeTicket(@Param('ticketID') ticketID: number): Promise<Ticket> {
    return this.ticketsService.closeTicket(ticketID);
  }

  @Get()
  async getTickets(
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('assignedAgent') assignedAgent?: string,
  ): Promise<Ticket[]> {
    return this.ticketsService.getTickets({ status, priority, assignedAgent });
  }
}
