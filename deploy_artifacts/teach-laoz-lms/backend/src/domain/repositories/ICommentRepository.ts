import { Comment } from '../entities/Comment.js';

export interface ICommentRepository {
  findByPostId(postId: string): Promise<Comment[]>;
  save(comment: Comment): Promise<void>;
}
