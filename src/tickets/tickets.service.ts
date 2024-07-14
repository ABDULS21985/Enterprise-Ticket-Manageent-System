// src/tickets/tickets.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from './entities/ticket.entity';
import { TicketHistoryService } from './ticket-history.service';
import { MailerService } from '../mailer/mailer.service';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private ticketsRepository: Repository<Ticket>,
    private ticketHistoryService: TicketHistoryService,
    private mailerService: MailerService,
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

  private async notifyCustomer(ticketID: number, message: string) {
    const ticket = await this.ticketsRepository.findOneBy({ ticketID });
    if (ticket) {
      const email = `${ticket.customerID}@example.com`; // Adjust this as necessary
      await this.mailerService.sendMail(email, 'Ticket Update', message);
    }
  }

  private async notifyAgent(agentID: string, message: string) {
    const email = `${agentID}@example.com`; // Adjust this as necessary
    await this.mailerService.sendMail(email, 'Ticket Assignment', message);
  }

  async autoAssignTicket(ticketID: number): Promise<Ticket> {
    const ticket = await this.ticketsRepository.findOneBy({ ticketID });
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    // Implement logic to find the best agent for this ticket
    const agentID = await this.findBestAgentForTicket(ticket);

    ticket.assignedAgent = agentID;
    ticket.status = 'In Progress';
    await this.ticketsRepository.save(ticket);
    return ticket;
  }

  private async findBestAgentForTicket(ticket: Ticket): Promise<string> {
    // Example logic: find the agent with the least number of tickets assigned
    const agents = ['agent1', 'agent2', 'agent3']; // Replace with actual agent IDs from your database
    const agentWorkloads = await Promise.all(
      agents.map(async (agentID) => ({
        agentID,
        workload: await this.ticketsRepository.count({ where: { assignedAgent: agentID } }),
      })),
    );

    const bestAgent = agentWorkloads.reduce((prev, curr) => (prev.workload < curr.workload ? prev : curr));
    return bestAgent.agentID;
  }
  async reassignTicket(ticketID: number, newAgentID: string): Promise<Ticket> {
    const ticket = await this.ticketsRepository.findOneBy({ ticketID });
    if (ticket && ticket.status === 'In Progress') {
      const oldValue = ticket.assignedAgent;
      ticket.assignedAgent = newAgentID;
      await this.ticketsRepository.save(ticket);
      await this.ticketHistoryService.logChange(ticketID, 'Reassigned Agent', oldValue, newAgentID);
      this.notifyAgent(newAgentID, 'Ticket reassigned');
      return ticket;
    }
    throw new Error('Ticket not found or not in progress');
  }
  





}
