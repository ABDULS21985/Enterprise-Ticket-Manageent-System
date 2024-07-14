// src/tickets/tickets.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { Ticket } from './entities/ticket.entity';
import { Comment } from './entities/comment.entity';
import { TicketHistory } from './entities/ticket-history.entity';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { TicketHistoryService } from './ticket-history.service';
import { TicketHistoryController } from './ticket-history.controller';
import { PriorityEscalationService } from './priority-escalation.service';
import { MailerService } from '../mailer/mailer.service';

@Module({
  imports: [TypeOrmModule.forFeature([Ticket, Comment, TicketHistory])],
  providers: [TicketsService, CommentsService, TicketHistoryService, PriorityEscalationService, MailerService],
  controllers: [TicketsController, CommentsController, TicketHistoryController],
})
export class TicketsModule {}
