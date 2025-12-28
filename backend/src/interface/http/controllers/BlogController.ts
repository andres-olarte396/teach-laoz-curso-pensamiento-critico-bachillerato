import { FastifyRequest, FastifyReply } from 'fastify';
import { ListPosts } from '../../../application/use-cases/blog/ListPosts.js';
import { GetPost } from '../../../application/use-cases/blog/GetPost.js';
import { FileSystemBlogRepository } from '../../../infrastructure/repositories/FileSystemBlogRepository.js';
import { UnifiedMarkdownRenderer } from '../../../infrastructure/services/UnifiedMarkdownRenderer.js';
import path from 'path';
import fs from 'fs';

export class BlogController {
  private readonly listPosts: ListPosts;
  private readonly getPost: GetPost;

  constructor() {
    // Robust path resolution for development: try root and sibling content folders
    let blogPath = path.resolve('content/blog');
    
    // Fallback if running from within backend/ directory
    if (!fs.existsSync(blogPath)) {
      blogPath = path.resolve('../content/blog');
    }
    
    const repository = new FileSystemBlogRepository(blogPath);
    const renderer = new UnifiedMarkdownRenderer();
    
    this.listPosts = new ListPosts(repository);
    this.getPost = new GetPost(repository, renderer);
  }

  async list(_request: FastifyRequest, reply: FastifyReply) {
    const posts = await this.listPosts.execute();
    return reply.send(posts);
  }

  async get(request: FastifyRequest<{ Params: { '*': string } }>, reply: FastifyReply) {
    const slug = request.params['*'];
    const post = await this.getPost.execute(slug);
    
    if (!post) {
      return reply.code(404).send({ message: 'Blog post not found' });
    }
    
    return reply.send(post);
  }
}
