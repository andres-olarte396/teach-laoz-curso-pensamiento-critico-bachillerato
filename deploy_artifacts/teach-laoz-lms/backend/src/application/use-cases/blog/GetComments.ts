import { ICommentRepository } from '../../../domain/repositories/ICommentRepository.js';
import { Comment } from '../../../domain/entities/Comment.js';

export class GetComments {
  constructor(private commentRepository: ICommentRepository) {}

  async execute(postId: string): Promise<Comment[]> {
    return this.commentRepository.findByPostId(postId);
  }
}
