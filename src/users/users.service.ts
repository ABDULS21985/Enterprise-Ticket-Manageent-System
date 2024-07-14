// src/users/users.service.ts

import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

export type User = any;

@Injectable()
export class UsersService {
  private readonly users: User[];

  constructor() {
    this.users = [
      {
        userId: 1,
        username: 'john',
        password: '$2b$10$Dowq5hlGv.kCpFZunhS5OeI9Gp/YhMi/fEmMBUpKOelCFcoJRuA92', // password: 'changeme'
      },
      {
        userId: 2,
        username: 'maria',
        password: '$2b$10$Dowq5hlGv.kCpFZunhS5OeI9Gp/YhMi/fEmMBUpKOelCFcoJRuA92', // password: 'guess'
      },
    ];
  }

  async create(createUserDto: any): Promise<User> {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(createUserDto.password, salt);
    const newUser = {
      userId: this.users.length + 1,
      username: createUserDto.username,
      password: hash,
    };
    this.users.push(newUser);
    return newUser;
  }

  async findOne(username: string): Promise<User | undefined> {
    return this.users.find(user => user.username === username);
  }
}
