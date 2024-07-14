// src/tickets/tickets.controller.ts

import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { Ticket } from './entities/ticket.entity';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/user-role.enum';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { File as MulterFile } from 'multer';

@Controller('tickets')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Roles(UserRole.Admin, UserRole.Agent)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createTicket(@Body() createTicketDto: CreateTicketDto) {
    return this.ticketsService.createTicket(createTicketDto.customerID, createTicketDto.issueDescription, createTicketDto.priority);
  }

  @Roles(UserRole.Admin, UserRole.Agent)
  @Patch(':ticketID/assign')
  @HttpCode(HttpStatus.OK)
  async assignTicket(@Param('ticketID') ticketID: number, @Body('agentID') agentID: string): Promise<Ticket> {
    return this.ticketsService.assignTicket(ticketID, agentID);
  }

  @Roles(UserRole.Admin, UserRole.Agent)
  @Patch(':ticketID/status')
  @HttpCode(HttpStatus.OK)
  async updateTicketStatus(@Param('ticketID') ticketID: number, @Body('status') status: string): Promise<Ticket> {
    return this.ticketsService.updateTicketStatus(ticketID, status);
  }

  @Roles(UserRole.Admin, UserRole.Agent)
  @Patch(':ticketID/close')
  @HttpCode(HttpStatus.OK)
  async closeTicket(@Param('ticketID') ticketID: number): Promise<Ticket> {
    return this.ticketsService.closeTicket(ticketID);
  }

  @Roles(UserRole.Admin, UserRole.Agent)
  @Patch(':ticketID/auto-assign')
  @HttpCode(HttpStatus.OK)
  async autoAssignTicket(@Param('ticketID') ticketID: number): Promise<Ticket> {
    return this.ticketsService.autoAssignTicket(ticketID);
  }

  @Roles(UserRole.Admin, UserRole.Agent)
  @Get()
  async getTickets(@Query('status') status?: string, @Query('priority') priority?: string, @Query('assignedAgent') assignedAgent?: string): Promise<Ticket[]> {
    return this.ticketsService.getTickets({ status, priority, assignedAgent });
  }

  @Roles(UserRole.Admin, UserRole.Agent)
  @Patch(':ticketID/reassign')
  @HttpCode(HttpStatus.OK)
  async reassignTicket(@Param('ticketID') ticketID: number, @Body('newAgentID') newAgentID: string): Promise<Ticket> {
    return this.ticketsService.reassignTicket(ticketID, newAgentID);
  }

  @Roles(UserRole.Admin, UserRole.Agent)
  @Post(':ticketID/attachments')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  @HttpCode(HttpStatus.CREATED)
  async addAttachment(@Param('ticketID') ticketID: number,  @UploadedFile() file: MulterFile, ) {
    return this.ticketsService.addAttachment(ticketID, file.filename, file.path, file.mimetype);
  }

  @Roles(UserRole.Admin, UserRole.Agent)
  @Get(':ticketID/attachments')
  async getAttachments(@Param('ticketID') ticketID: number) {
    return this.ticketsService.getAttachments(ticketID);
  }

  @Roles(UserRole.Customer)
  @Patch(':ticketID/feedback')
  async addCustomerFeedback(@Param('ticketID') ticketID: number, @Body('feedback') feedback: string): Promise<Ticket> {
    return this.ticketsService.addCustomerFeedback(ticketID, feedback);
  }

  @Roles(UserRole.Admin, UserRole.Agent)
  @Patch(':ticketID/tags/add')
  async addTag(@Param('ticketID') ticketID: number, @Body('tag') tag: string): Promise<Ticket> {
    return this.ticketsService.addTag(ticketID, tag);
  }

  @Roles(UserRole.Admin, UserRole.Agent)
  @Patch(':ticketID/tags/remove')
  async removeTag(@Param('ticketID') ticketID: number, @Body('tag') tag: string): Promise<Ticket> {
    return this.ticketsService.removeTag(ticketID, tag);
  }

  @Roles(UserRole.Customer)
  @Get(':id')
  async getTicket(@Param('id') id: number) {
    return this.ticketsService.getTicketById(id);
  }
}