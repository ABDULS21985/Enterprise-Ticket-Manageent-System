import { PartialType } from '@nestjs/mapped-types';
import { CreateTicketDto } from './create-ticket.dto';

// src/tickets/dto/update-ticket.dto.ts
export class UpdateTicketDto {
    status: string;
    assignedAgent?: string;
  }