import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Ticket } from './entities/ticket.entity';
import { TicketHistoryService } from './ticket-history.service';
import { MailerService } from '../mailer/mailer.service';
import { Attachment } from './entities/attachment.entity';
import { addHours } from 'date-fns';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private ticketsRepository: Repository<Ticket>,
    @InjectRepository(Attachment)
    private attachmentsRepository: Repository<Attachment>,
    private ticketHistoryService: TicketHistoryService,
    private mailerService: MailerService,
  ) {}

  async createTicket(customerID: string, issueDescription: string, priority: string): Promise<Ticket> {
    const slaDueDate = this.calculateSLADueDate(priority);

    const ticket = this.ticketsRepository.create({
      customerID,
      issueDescription,
      status: 'Open',
      priority,
      assignedAgent: null,
      creationDate: new Date(),
      resolutionDate: null,
      slaDueDate,
    });

    await this.ticketsRepository.save(ticket);
    this.notifyCustomer(ticket.ticketID, 'Ticket created');
    return ticket;
  }

  private calculateSLADueDate(priority: string): Date {
    const currentDate = new Date();
    switch (priority) {
      case 'Urgent':
        return addHours(currentDate, 4);
      case 'High':
        return addHours(currentDate, 8);
      case 'Medium':
        return addHours(currentDate, 24);
      case 'Low':
        return addHours(currentDate, 48);
      default:
        return currentDate;
    }
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

  async addAttachment(ticketID: number, filename: string, filepath: string, mimetype: string): Promise<Attachment> {
    const ticket = await this.ticketsRepository.findOneBy({ ticketID });
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    const attachment = this.attachmentsRepository.create({
      ticket,
      filename,
      filepath,
      mimetype,
    });

    await this.attachmentsRepository.save(attachment);
    return attachment;
  }

  async getAttachments(ticketID: number): Promise<Attachment[]> {
    return this.attachmentsRepository.find({ where: { ticket: { ticketID } } });
  }

  async updateTicketStatus(ticketID: number, status: string): Promise<Ticket> {
    const ticket = await this.ticketsRepository.findOneBy({ ticketID });
    if (ticket) {
      const oldValue = ticket.status;
      ticket.status = status;
      if (status === 'Resolved') {
        ticket.resolutionDate = new Date();
        this.requestCustomerFeedback(ticket.customerID, ticket.ticketID);
      }
      await this.ticketsRepository.save(ticket);
      await this.ticketHistoryService.logChange(ticketID, 'Status Update', oldValue, status);
      this.notifyCustomer(ticket.ticketID, `Ticket status updated to ${status}`);
      return ticket;
    }
    throw new Error('Ticket not found');
  }

  private async requestCustomerFeedback(customerID: string, ticketID: number) {
    const email = `${customerID}@example.com`;
    const message = `Your ticket with ID ${ticketID} has been resolved. Please provide your feedback: <feedback link>`;
    await this.mailerService.sendMail(email, 'Ticket Resolved - Feedback Request', message);
  }

  async addCustomerFeedback(ticketID: number, feedback: string): Promise<Ticket> {
    const ticket = await this.ticketsRepository.findOneBy({ ticketID });
    if (ticket) {
      ticket.customerFeedback = feedback;
      await this.ticketsRepository.save(ticket);
      return ticket;
    }
    throw new Error('Ticket not found');
  }

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
      this.notifyAgent(ticket.assignedAgent, `Ticket ${ticket.ticketID} has breached SLA`);
      this.notifyCustomer(ticket.ticketID, `Your ticket ${ticket.ticketID} has breached SLA`);
      // Optionally, escalate the ticket or update its status
    }
  }

  async addTag(ticketID: number, tag: string): Promise<Ticket> {
    const ticket = await this.ticketsRepository.findOneBy({ ticketID });
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    if (!ticket.tags) {
      ticket.tags = [];
    }

    if (!ticket.tags.includes(tag)) {
      ticket.tags.push(tag);
      await this.ticketsRepository.save(ticket);
    }

    return ticket;
  }

  async removeTag(ticketID: number, tag: string): Promise<Ticket> {
    const ticket = await this.ticketsRepository.findOneBy({ ticketID });
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    ticket.tags = ticket.tags.filter(t => t !== tag);
    await this.ticketsRepository.save(ticket);

    return ticket;
  }

} 
