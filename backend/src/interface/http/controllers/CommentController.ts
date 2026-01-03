import { FastifyRequest, FastifyReply } from 'fastify';
import { AddComment } from '../../../application/use-cases/blog/AddComment.js';
import { GetComments } from '../../../application/use-cases/blog/GetComments.js';
import { SQLiteCommentRepository } from '../../../infrastructure/repositories/SQLiteCommentRepository.js';

export class CommentController {
  private addComment: AddComment;
  private getComments: GetComments;

  constructor() {
    const commentRepository = new SQLiteCommentRepository();
    this.addComment = new AddComment(commentRepository);
    this.getComments = new GetComments(commentRepository);
  }

  async list(req: FastifyRequest<{ Params: { resourceId: string } }>, reply: FastifyReply) {
    const { resourceId } = req.params;
    try {
      const comments = await this.getComments.execute(resourceId);
      return reply.send(comments);
    } catch (error) {
      req.log.error(error);
      return reply.code(500).send({ message: 'Error listing comments' });
    }
  }

  async create(req: FastifyRequest<{ Params: { resourceId: string }; Body: { authorName?: string; content: string } }>, reply: FastifyReply) {
    const { resourceId } = req.params;
    const { authorName, content } = req.body;
    const user = req.user as any;

    if (!content) {
      return reply.code(400).send({ message: 'Content is required' });
    }

    // Use logged in user name if available, otherwise 'Anonymous' (or require login)
    // The route will likely be authenticated, so we can use user.name or user.email
    const name = authorName || user?.name || user?.email || 'Anonymous';
    const email = user?.email;

    try {
      const comment = await this.addComment.execute({
        postId: resourceId, // reuse 'postId' field for generic resourceId
        authorName: name,
        authorEmail: email,
        content
      });
      return reply.code(201).send(comment);
    } catch (error) {
        req.log.error(error);
      return reply.code(500).send({ message: 'Error creating comment' });
    }
  }
}
