// src/tickets/tickets.controller.ts

import { Controller, Post, Patch, Param, Body, Get, Query, UseGuards } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { Ticket } from './entities/ticket.entity';
import { AuthGuard } from '@nestjs/passport';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async createTicket(
    @Body('customerID') customerID: string,
    @Body('issueDescription') issueDescription: string,
    @Body('priority') priority: string,
  ): Promise<Ticket> {
    return this.ticketsService.createTicket(customerID, issueDescription, priority);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':ticketID/assign')
  async assignTicket(
    @Param('ticketID') ticketID: number,
    @Body('agentID') agentID: string,
  ): Promise<Ticket> {
    return this.ticketsService.assignTicket(ticketID, agentID);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':ticketID/status')
  async updateTicketStatus(
    @Param('ticketID') ticketID: number,
    @Body('status') status: string,
  ): Promise<Ticket> {
    return this.ticketsService.updateTicketStatus(ticketID, status);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':ticketID/close')
  async closeTicket(@Param('ticketID') ticketID: number): Promise<Ticket> {
    return this.ticketsService.closeTicket(ticketID);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':ticketID/auto-assign')
  async autoAssignTicket(@Param('ticketID') ticketID: number): Promise<Ticket> {
    return this.ticketsService.autoAssignTicket(ticketID);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getTickets(
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('assignedAgent') assignedAgent?: string,
  ): Promise<Ticket[]> {
    return this.ticketsService.getTickets({ status, priority, assignedAgent });
  }
  @Patch(':ticketID/reassign')
  async reassignTicket(
    @Param('ticketID') ticketID: number,
    @Body('newAgentID') newAgentID: string,
  ): Promise<Ticket> {
    return this.ticketsService.reassignTicket(ticketID, newAgentID);
  }
  

}
