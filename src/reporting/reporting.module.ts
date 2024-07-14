// src/reporting/reporting.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportingService } from './reporting.service';
import { ReportingController } from './reporting.controller';
import { TicketsModule } from '../tickets/tickets.module';
import { Ticket } from '../tickets/entities/ticket.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ticket]),
    TicketsModule, // Importing the TicketsModule to provide TicketRepository
  ],
  providers: [ReportingService],
  controllers: [ReportingController],
})
export class ReportingModule {}
