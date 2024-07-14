import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { Ticket } from './entities/ticket.entity';
import { Comment } from './entities/comment.entity';
import { TicketHistory } from './entities/ticket-history.entity';
import { Attachment } from './entities/attachment.entity';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { TicketHistoryService } from './ticket-history.service';
import { TicketHistoryController } from './ticket-history.controller';
import { PriorityEscalationService } from './priority-escalation.service';
import { MailerService } from '../mailer/mailer.service';
import { ReportingService } from '../reporting/reporting.service';
import { ReportingController } from '../reporting/reporting.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Ticket, Comment, TicketHistory, Attachment])],
  providers: [
    TicketsService,
    CommentsService,
    TicketHistoryService,
    PriorityEscalationService,
    MailerService,
    ReportingService,
  ],
  controllers: [
    TicketsController,
    CommentsController,
    TicketHistoryController,
    ReportingController,
  ],
  exports: [TypeOrmModule], // Export TypeOrmModule to make the entities available
})
export class TicketsModule {}
