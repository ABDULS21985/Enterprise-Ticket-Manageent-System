// src/tickets/comments.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
  ) {}

  async addComment(ticketID: number, author: string, content: string): Promise<Comment> {
    const comment = this.commentsRepository.create({
      ticketID,
      author,
      content,
      creationDate: new Date(),
    });

    return this.commentsRepository.save(comment);
  }

  async getComments(ticketID: number): Promise<Comment[]> {
    return this.commentsRepository.find({ where: { ticketID } });
  }
}
