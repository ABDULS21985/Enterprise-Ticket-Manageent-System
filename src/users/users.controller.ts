// src/users/users.controller.ts

import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  async register(@Body() createUserDto: any) {
    return this.usersService.create(createUserDto);
  }

  @Get(':username')
  async findOne(@Param('username') username: string) {
    return this.usersService.findOne(username);
  }
}
