import { ICommentRepository } from '../../../domain/repositories/ICommentRepository.js';
import { Comment } from '../../../domain/entities/Comment.js';
import { randomUUID } from 'crypto';

export interface AddCommentDTO {
  postId: string;
  authorName: string;
  authorEmail?: string;
  content: string;
}

export class AddComment {
  constructor(private commentRepository: ICommentRepository) {}

  async execute(dto: AddCommentDTO): Promise<Comment> {
    const comment: Comment = {
      id: randomUUID(),
      postId: dto.postId,
      authorName: dto.authorName,
      authorEmail: dto.authorEmail,
      content: dto.content,
      createdAt: new Date()
    };

    await this.commentRepository.save(comment);
    return comment;
  }
}
