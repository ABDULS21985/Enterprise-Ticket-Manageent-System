// src/tickets/tickets.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from './entities/ticket.entity';
import { TicketHistoryService } from './ticket-history.service';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private ticketsRepository: Repository<Ticket>,
    private ticketHistoryService: TicketHistoryService,
  ) {}

  async createTicket(customerID: string, issueDescription: string, priority: string): Promise<Ticket> {
    const ticket = this.ticketsRepository.create({
      customerID,
      issueDescription,
      status: 'Open',
      priority,
      assignedAgent: null,
      creationDate: new Date(),
      resolutionDate: null,
    });

    await this.ticketsRepository.save(ticket);
    this.notifyCustomer(ticket.ticketID, 'Ticket created');
    return ticket;
  }

  async assignTicket(ticketID: number, agentID: string): Promise<Ticket> {
    const ticket = await this.ticketsRepository.findOneBy({ ticketID });
    if (ticket && ticket.status === 'Open') {
      const oldValue = ticket.assignedAgent;
      ticket.assignedAgent = agentID;
      ticket.status = 'In Progress';
      await this.ticketsRepository.save(ticket);
      await this.ticketHistoryService.logChange(ticketID, 'Assigned Agent', oldValue, agentID);
      this.notifyAgent(agentID, 'Ticket assigned');
      return ticket;
    }
    throw new Error('Ticket not found or already in progress');
  }

  async updateTicketStatus(ticketID: number, status: string): Promise<Ticket> {
    const ticket = await this.ticketsRepository.findOneBy({ ticketID });
    if (ticket) {
      const oldValue = ticket.status;
      ticket.status = status;
      if (status === 'Resolved') {
        ticket.resolutionDate = new Date();
      }
      await this.ticketsRepository.save(ticket);
      await this.ticketHistoryService.logChange(ticketID, 'Status Update', oldValue, status);
      this.notifyCustomer(ticket.ticketID, `Ticket status updated to ${status}`);
      return ticket;
    }
    throw new Error('Ticket not found');
  }

  async closeTicket(ticketID: number): Promise<Ticket> {
    const ticket = await this.ticketsRepository.findOneBy({ ticketID });
    if (ticket && ticket.status === 'Resolved') {
      const oldValue = ticket.status;
      ticket.status = 'Closed';
      await this.ticketsRepository.save(ticket);
      await this.ticketHistoryService.logChange(ticketID, 'Status Update', oldValue, 'Closed');
      this.notifyCustomer(ticket.ticketID, 'Ticket closed');
      return ticket;
    }
    throw new Error('Ticket not found or not resolved');
  }

  async getTickets(filter: { status?: string; priority?: string; assignedAgent?: string }): Promise<Ticket[]> {
    const query = this.ticketsRepository.createQueryBuilder('ticket');

    if (filter.status) {
      query.andWhere('ticket.status = :status', { status: filter.status });
    }

    if (filter.priority) {
      query.andWhere('ticket.priority = :priority', { priority: filter.priority });
    }

    if (filter.assignedAgent) {
      query.andWhere('ticket.assignedAgent = :assignedAgent', { assignedAgent: filter.assignedAgent });
    }

    return query.getMany();
  }

  private notifyCustomer(ticketID: number, message: string) {
    // Logic to notify the customer
  }

  private notifyAgent(agentID: string, message: string) {
    // Logic to notify the agent
  }
}
