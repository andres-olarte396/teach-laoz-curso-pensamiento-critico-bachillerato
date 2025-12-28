import fs from 'fs/promises';
import path from 'path';
import { BlogPost } from '../../domain/blog/BlogPost.js';
import { BlogPostRepository } from '../../domain/blog/BlogPostRepository.js';
import yaml from 'yaml';
import { z } from 'zod';

const BlogFrontmatterSchema = z.object({
  title: z.string(),
  date: z.string().optional(),
  author: z.string().default('Admin'),
  excerpt: z.string().optional(),
  tags: z.array(z.string()).default([]),
  imageUrl: z.string().optional(),
  published: z.boolean().default(true),
});

export class FileSystemBlogRepository implements BlogPostRepository {
  constructor(private readonly basePath: string) {}

  async listAll(): Promise<BlogPost[]> {
    try {
      // Ensure directory exists
      try {
        await fs.access(this.basePath);
      } catch {
        return [];
      }

      const posts: BlogPost[] = [];
      await this.scanDirectory(this.basePath, posts);

      // Sort by date descending
      return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
      console.error('Error listing blog posts:', error);
      return [];
    }
  }

  private async scanDirectory(directory: string, posts: BlogPost[]): Promise<void> {
    const entries = await fs.readdir(directory, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);
      
      if (entry.isDirectory()) {
        await this.scanDirectory(fullPath, posts);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        // Calculate relative path for slug (handle multi-level categories)
        const relativePath = path.relative(this.basePath, fullPath);
        const slug = relativePath.replace(/\\/g, '/').replace('.md', '');
        
        const post = await this.getBySlug(slug);
        if (post && post.published) {
          posts.push(post);
        }
      }
    }
  }

  async getBySlug(slug: string): Promise<BlogPost | null> {
    try {
      // slug matches the relative path without extension (e.g., "tecnologia-software/la-doctrina-americana-chomsky")
      const filePath = path.join(this.basePath, `${slug}.md`);
      const fileContent = await fs.readFile(filePath, 'utf-8');
      
      const { frontmatter, content } = this.parseFrontmatter(fileContent);
      
      const parsed = BlogFrontmatterSchema.safeParse(frontmatter);
      if (!parsed.success) {
        console.warn(`Invalid frontmatter for post ${slug}:`, parsed.error);
        return null;
      }

      const data = parsed.data;

      // Use file creation time if date not provided
      let date = data.date;
      if (!date) {
        const stats = await fs.stat(filePath);
        date = stats.birthtime.toISOString();
      }

      return {
        slug,
        title: data.title,
        excerpt: data.excerpt || '',
        content,
        author: data.author,
        date: date!,
        tags: data.tags,
        imageUrl: data.imageUrl,
        published: data.published,
      };

    } catch (error) {
       // File not found or other error
       return null;
    }
  }

  private parseFrontmatter(fileContent: string): { frontmatter: any, content: string } {
    // Robust regex to capture frontmatter even with trailing spaces or different line endings
    const match = fileContent.match(/^---\r?\n([\s\S]*?)\r?\n---\s*?\r?\n([\s\S]*)$/);
    if (match) {
      try {
        const frontmatter = yaml.parse(match[1]);
        const content = match[2];
        return { frontmatter, content };
      } catch (e) {
        console.error('Error parsing YAML frontmatter:', e);
      }
    }
    // Fallback if no frontmatter
    return { frontmatter: { title: 'Untitled' }, content: fileContent };
  }
}
