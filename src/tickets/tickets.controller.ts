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
import { Express } from 'express';
import { Muter } from 'multer';
import { File as MulterFile } from 'multer'; 

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createTicket(
    @Body('customerID') customerID: string,
    @Body('issueDescription') issueDescription: string,
    @Body('priority') priority: string,
  ): Promise<Ticket> {
    return this.ticketsService.createTicket(customerID, issueDescription, priority);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':ticketID/assign')
  @HttpCode(HttpStatus.OK)
  async assignTicket(
    @Param('ticketID') ticketID: number,
    @Body('agentID') agentID: string,
  ): Promise<Ticket> {
    return this.ticketsService.assignTicket(ticketID, agentID);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':ticketID/status')
  @HttpCode(HttpStatus.OK)
  async updateTicketStatus(
    @Param('ticketID') ticketID: number,
    @Body('status') status: string,
  ): Promise<Ticket> {
    return this.ticketsService.updateTicketStatus(ticketID, status);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':ticketID/close')
  @HttpCode(HttpStatus.OK)
  async closeTicket(@Param('ticketID') ticketID: number): Promise<Ticket> {
    return this.ticketsService.closeTicket(ticketID);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':ticketID/auto-assign')
  @HttpCode(HttpStatus.OK)
  async autoAssignTicket(@Param('ticketID') ticketID: number): Promise<Ticket> {
    return this.ticketsService.autoAssignTicket(ticketID);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getTickets(
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('assignedAgent') assignedAgent?: string,
  ): Promise<Ticket[]> {
    return this.ticketsService.getTickets({ status, priority, assignedAgent });
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':ticketID/reassign')
  @HttpCode(HttpStatus.OK)
  async reassignTicket(
    @Param('ticketID') ticketID: number,
    @Body('newAgentID') newAgentID: string,
  ): Promise<Ticket> {
    return this.ticketsService.reassignTicket(ticketID, newAgentID);
  }

  @UseGuards(AuthGuard('jwt'))
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
  async addAttachment(
    @Param('ticketID') ticketID: number,
    @UploadedFile() file: MulterFile, 
  ) {
    return this.ticketsService.addAttachment(ticketID, file.filename, file.path, file.mimetype);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':ticketID/attachments')
  async getAttachments(@Param('ticketID') ticketID: number) {
    return this.ticketsService.getAttachments(ticketID);
  }
}
