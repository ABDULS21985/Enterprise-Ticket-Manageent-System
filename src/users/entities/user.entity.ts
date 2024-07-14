// src/users/entities/user.entity.ts

import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { UserRole } from '../user-role.enum';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  password: string;

  @Column('text')
  role: UserRole;
}