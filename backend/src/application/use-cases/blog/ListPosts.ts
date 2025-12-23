import { BlogPost } from '../../domain/blog/BlogPost.js';
import { BlogPostRepository } from '../../domain/blog/BlogPostRepository.js';

export class ListPosts {
  constructor(private readonly blogRepository: BlogPostRepository) {}

  async execute(): Promise<BlogPost[]> {
    const posts = await this.blogRepository.listAll();
    // Optimization: returning full posts for now. 
    // In a future iter, we might want to return a summary DTO (omit content).
    return posts;
  }
}
