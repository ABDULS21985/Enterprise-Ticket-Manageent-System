// src/tickets/comments.controller.ts

import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { Comment } from './entities/comment.entity';

@Controller('tickets/:ticketID/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  async addComment(
    @Param('ticketID') ticketID: number,
    @Body('author') author: string,
    @Body('content') content: string,
  ): Promise<Comment> {
    return this.commentsService.addComment(ticketID, author, content);
  }

  @Get()
  async getComments(@Param('ticketID') ticketID: number): Promise<Comment[]> {
    return this.commentsService.getComments(ticketID);
  }
}
