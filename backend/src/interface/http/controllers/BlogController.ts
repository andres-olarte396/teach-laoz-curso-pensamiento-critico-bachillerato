import { FastifyRequest, FastifyReply } from 'fastify';
import { ListPosts } from '../../../application/use-cases/blog/ListPosts.js';
import { GetPost } from '../../../application/use-cases/blog/GetPost.js';
import { FileSystemBlogRepository } from '../../../infrastructure/repositories/FileSystemBlogRepository.js';
import { UnifiedMarkdownRenderer } from '../../../infrastructure/services/UnifiedMarkdownRenderer.js';
import path from 'path';

export class BlogController {
  private readonly listPosts: ListPosts;
  private readonly getPost: GetPost;

  constructor() {
    // Assuming backend is running from 'backend/' directory
    // content is at '../content/blog'
    const blogPath = path.join(process.cwd(), '../content/blog');
    const repository = new FileSystemBlogRepository(blogPath);
    const renderer = new UnifiedMarkdownRenderer();
    
    this.listPosts = new ListPosts(repository);
    this.getPost = new GetPost(repository, renderer);
  }

  async list(_request: FastifyRequest, reply: FastifyReply) {
    const posts = await this.listPosts.execute();
    return reply.send(posts);
  }

  async get(request: FastifyRequest<{ Params: { slug: string } }>, reply: FastifyReply) {
    const { slug } = request.params;
    const post = await this.getPost.execute(slug);
    
    if (!post) {
      return reply.code(404).send({ message: 'Blog post not found' });
    }
    
    return reply.send(post);
  }
}
