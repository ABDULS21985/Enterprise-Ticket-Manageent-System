import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class TicketForm {
  @PrimaryGeneratedColumn()
  formID: number;

  @Column()
  formName: string;

  @Column('json')
  formFields: any;
}
