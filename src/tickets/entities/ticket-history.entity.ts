// src/tickets/entities/ticket-history.entity.ts

import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Ticket } from './ticket.entity';

@Entity()
export class TicketHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  ticketID: number;

  @Column()
  changeType: string; // e.g., Status Update, Comment Added

  @Column({ nullable: true })
  oldValue: string;

  @Column()
  newValue: string;

  @Column()
  changeDate: Date;

  @ManyToOne(() => Ticket, ticket => ticket.history)
  ticket: Ticket;
}
