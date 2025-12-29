import { ICommentRepository } from '../../../domain/repositories/ICommentRepository.js';
import { Comment } from '../../../domain/entities/Comment.js';
import { crypto } from '../../../../shared/utils/crypto.js'; // Assuming a crypto util exists for IDs

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
      id: Math.random().toString(36).substr(2, 9), // Simple ID generator for now
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
