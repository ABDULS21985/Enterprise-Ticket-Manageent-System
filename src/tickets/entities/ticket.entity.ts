// src/tickets/entities/ticket.entity.ts

import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Comment } from './comment.entity';
import { TicketHistory } from './ticket-history.entity';

@Entity()
export class Ticket {
  @PrimaryGeneratedColumn()
  ticketID: number;

  @Column()
  customerID: string;

  @Column()
  issueDescription: string;

  @Column()
  status: string; // e.g., Open, In Progress, Resolved, Closed

  @Column()
  priority: string; // e.g., Low, Medium, High, Urgent

  @Column({ nullable: true })
  assignedAgent: string;

  @Column()
  creationDate: Date;

  @Column({ nullable: true })
  resolutionDate: Date;

  @Column({ nullable: true })
  lastEscalationDate: Date;  // New column for tracking the last escalation date

  @OneToMany(() => Comment, comment => comment.ticket)
  comments: Comment[];

  @OneToMany(() => TicketHistory, history => history.ticket)
  history: TicketHistory[];
}