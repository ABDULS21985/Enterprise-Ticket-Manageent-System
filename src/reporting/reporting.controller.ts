// src/reporting/reporting.controller.ts

import { Controller, Get } from '@nestjs/common';
import { ReportingService } from './reporting.service';

@Controller('reporting')
export class ReportingController {
  constructor(private readonly reportingService: ReportingService) {}

  @Get('statistics')
  async getTicketStatistics() {
    return this.reportingService.getTicketStatistics();
  }
}
