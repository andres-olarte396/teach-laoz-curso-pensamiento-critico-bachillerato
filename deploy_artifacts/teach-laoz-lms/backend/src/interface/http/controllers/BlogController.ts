import { FastifyRequest, FastifyReply } from 'fastify';
import { ListPosts } from '../../../application/use-cases/blog/ListPosts.js';
import { GetPost } from '../../../application/use-cases/blog/GetPost.js';
import { AddComment } from '../../../application/use-cases/blog/AddComment.js';
import { GetComments } from '../../../application/use-cases/blog/GetComments.js';
import { FileSystemBlogRepository } from '../../../infrastructure/repositories/FileSystemBlogRepository.js';
import { SQLiteCommentRepository } from '../../../infrastructure/repositories/SQLiteCommentRepository.js';
import { UnifiedMarkdownRenderer } from '../../../infrastructure/services/UnifiedMarkdownRenderer.js';
import path from 'path';
import fs from 'fs';

export class BlogController {
  public readonly listPosts: ListPosts;
  public readonly getPost: GetPost;
  public readonly addComment: AddComment;
  public readonly getComments: GetComments;

  constructor() {
    // Robust path resolution for development: try root and sibling content folders
    let blogPath = path.resolve('content/blog');
    
    // Fallback if running from within backend/ directory
    if (!fs.existsSync(blogPath)) {
      blogPath = path.resolve('../content/blog');
    }
    
    const blogRepository = new FileSystemBlogRepository(blogPath);
    const commentRepository = new SQLiteCommentRepository();
    const renderer = new UnifiedMarkdownRenderer();
    
    this.listPosts = new ListPosts(blogRepository);
    this.getPost = new GetPost(blogRepository, renderer);
    this.addComment = new AddComment(commentRepository);
    this.getComments = new GetComments(commentRepository);
  }

  async list(_request: FastifyRequest, reply: FastifyReply) {
    try {
      const posts = await this.listPosts.execute();
      return reply.send(posts);
    } catch (error) {
      return reply.code(500).send({ message: 'Error listing posts' });
    }
  }

  async get(request: FastifyRequest<{ Params: { '*': string } }>, reply: FastifyReply) {
    const slug = request.params['*'];
    try {
      const post = await this.getPost.execute(slug);
      if (!post) {
        return reply.code(404).send({ message: 'Blog post not found' });
      }
      return reply.send(post);
    } catch (error) {
      return reply.code(500).send({ message: 'Error fetching post' });
    }
  }

  async listComments(request: FastifyRequest<{ Params: { slug: string } }>, reply: FastifyReply) {
    const { slug } = request.params;
    try {
      const comments = await this.getComments.execute(slug);
      return reply.send(comments);
    } catch (error) {
      return reply.code(500).send({ message: 'Error listing comments' });
    }
  }

  async createComment(request: FastifyRequest<{ Params: { slug: string }; Body: { authorName: string; authorEmail?: string; content: string } }>, reply: FastifyReply) {
    const { slug } = request.params;
    const { authorName, authorEmail, content } = request.body;
    
    if (!authorName || !content) {
      return reply.code(400).send({ message: 'Author name and content are required' });
    }

    try {
      const comment = await this.addComment.execute({
        postId: slug,
        authorName,
        authorEmail,
        content
      });
      return reply.code(201).send(comment);
    } catch (error) {
      return reply.code(500).send({ message: 'Error creating comment' });
    }
  }
}
