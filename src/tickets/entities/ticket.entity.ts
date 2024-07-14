import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne } from 'typeorm';
import { Comment } from './comment.entity';
import { TicketHistory } from './ticket-history.entity';
import { Attachment } from './attachment.entity';
import { TicketForm } from './ticket-form.entity';

@Entity()
export class Ticket {
  @PrimaryGeneratedColumn()
  ticketID: number;

  @Column()
  customerID: string;

  @Column()
  issueDescription: string;

  @Column()
  status: string;

  @Column()
  priority: string;

  @Column({ nullable: true })
  assignedAgent: string;

  @Column()
  creationDate: Date;

  @Column({ nullable: true })
  resolutionDate: Date;

  @Column({ nullable: true })
  lastEscalationDate: Date;

  @Column({ nullable: true })
  slaDueDate: Date;

  @OneToMany(() => Comment, comment => comment.ticket)
  comments: Comment[];

  @OneToMany(() => TicketHistory, history => history.ticket)
  history: TicketHistory[];

  @OneToMany(() => Attachment, attachment => attachment.ticket)
  attachments: Attachment[];

  @Column({ nullable: true })
  customerFeedback: string;

  @Column('simple-array', { nullable: true, default: '' })
  tags: string[];

  @ManyToOne(() => TicketForm)
  ticketForm: TicketForm;
}
