import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TicketForm } from './entities/ticket-form.entity'; // Correct path here

@Injectable()
export class TicketFormService {
  constructor(
    @InjectRepository(TicketForm)
    private ticketFormRepository: Repository<TicketForm>,
  ) {}

  async createForm(formName: string, formFields: any): Promise<TicketForm> {
    const form = this.ticketFormRepository.create({ formName, formFields });
    return this.ticketFormRepository.save(form);
  }

  async getForm(formID: number): Promise<TicketForm> {
    return this.ticketFormRepository.findOneBy({ formID });
  }

  async getForms(): Promise<TicketForm[]> {
    return this.ticketFormRepository.find();
  }

  async updateForm(formID: number, formFields: any): Promise<TicketForm> {
    await this.ticketFormRepository.update({ formID }, { formFields });
    return this.getForm(formID);
  }
}
