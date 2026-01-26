import { BlogPost } from './BlogPost.js';

export interface BlogPostRepository {
  listAll(): Promise<BlogPost[]>;
  getBySlug(slug: string): Promise<BlogPost | null>;
}
