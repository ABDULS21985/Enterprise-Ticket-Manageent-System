import { Controller, Post, Get, Put, Body, Param } from '@nestjs/common';
import { TicketFormService } from './ticket-form.service';

@Controller('forms')
export class TicketFormController {
  constructor(private readonly ticketFormService: TicketFormService) {}

  @Post()
  async createForm(
    @Body('formName') formName: string,
    @Body('formFields') formFields: any,
  ) {
    return this.ticketFormService.createForm(formName, formFields);
  }

  @Get(':formID')
  async getForm(@Param('formID') formID: number) {
    return this.ticketFormService.getForm(formID);
  }

  @Get()
  async getForms() {
    return this.ticketFormService.getForms();
  }

  @Put(':formID')
  async updateForm(
    @Param('formID') formID: number,
    @Body('formFields') formFields: any,
  ) {
    return this.ticketFormService.updateForm(formID, formFields);
  }
}
