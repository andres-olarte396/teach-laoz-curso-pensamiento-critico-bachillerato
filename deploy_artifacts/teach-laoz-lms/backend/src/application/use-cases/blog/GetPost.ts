import { BlogPost } from '../../../domain/blog/BlogPost.js';
import { BlogPostRepository } from '../../../domain/blog/BlogPostRepository.js';

import { IMarkdownRenderer } from '../../../domain/services/IMarkdownRenderer.js';

export class GetPost {
  constructor(
    private readonly blogRepository: BlogPostRepository,
    private readonly markdownRenderer: IMarkdownRenderer
  ) {}

  async execute(slug: string): Promise<BlogPost | null> {
    const post = await this.blogRepository.getBySlug(slug);
    if (!post) return null;

    const html = await this.markdownRenderer.render(post.content);
    return { ...post, html };
  }
}
