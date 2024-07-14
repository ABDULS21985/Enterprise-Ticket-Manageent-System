// src/tickets/entities/comment.entity.ts

import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Ticket } from './ticket.entity';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn()
  commentID: number;

  @Column()
  ticketID: number;

  @Column()
  author: string;

  @Column()
  content: string;

  @Column()
  creationDate: Date;

  @ManyToOne(() => Ticket, ticket => ticket.comments)
  ticket: Ticket;
}
