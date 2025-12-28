import fs from 'fs/promises';
import path from 'path';
import yaml from 'yaml';
import { z } from 'zod';
import { Course } from '../../domain/course/Course.js';

const CourseFrontmatterSchema = z.object({
  title: z.string().optional(),
  summary: z.string().optional(),
  author: z.string().default('Teacher LAOZ'),
  date: z.string().optional(),
  tags: z.array(z.string()).default([]),
  category: z.string().default('General'),
  imageUrl: z.string().optional(),
  level: z.enum(['Básico', 'Intermedio', 'Avanzado']).default('Básico'),
  published: z.boolean().default(true),
});

export class FileSystemCourseRepository {
  constructor(private readonly basePath: string) {}

  async listAll(): Promise<Course[]> {
    try {
      const courses: Course[] = [];
      const entries = await fs.readdir(this.basePath, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.isDirectory()) {
          const courseId = entry.name;
          const coursePath = path.join(this.basePath, courseId);
          
          // Try to find metadata in INDICE.md or index.md
          const courseMetadata = await this.getCourseMetadata(coursePath, courseId);
          if (courseMetadata && courseMetadata.published) {
            courses.push(courseMetadata);
          }
        }
      }

      // Sort by date descending (most recent first)
      return courses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
      console.error('Error listing courses:', error);
      return [];
    }
  }

  private async getCourseMetadata(coursePath: string, courseId: string): Promise<Course | null> {
    const commonNames = ['INDICE.md', 'index.md', 'README.md'];
    
    for (const name of commonNames) {
      const filePath = path.join(coursePath, name);
      try {
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const { frontmatter } = this.parseFrontmatter(fileContent);
        
        const parsed = CourseFrontmatterSchema.safeParse(frontmatter);
        if (parsed.success) {
          const data = parsed.data;
          
          // Fallback title from directory name if not in frontmatter
          const title = data.title || this.formatTitle(courseId);
          
          // Use file creation time if date not provided
          let date = data.date;
          if (!date) {
            const stats = await fs.stat(filePath);
            date = stats.mtime.toISOString();
          }

          return {
            id: courseId,
            title,
            summary: data.summary || '',
            author: data.author,
            date,
            tags: data.tags,
            category: data.category,
            imageUrl: data.imageUrl,
            level: data.level,
            published: data.published,
          };
        }
      } catch (e) {
        // Continue to next common file name
      }
    }

    // Default metadata if no INDICE.md found
    return {
        id: courseId,
        title: this.formatTitle(courseId),
        summary: 'Curso interactivo en Teach LAOZ.',
        author: 'Teacher LAOZ',
        date: new Date().toISOString(),
        tags: [],
        category: 'General',
        published: true,
        level: 'Básico'
    };
  }

  private parseFrontmatter(fileContent: string): { frontmatter: any, content: string } {
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
    return { frontmatter: {}, content: fileContent };
  }

  private formatTitle(name: string): string {
    let title = name.replace(/^(teach|laoz|curso|learning|system|courses?|educacion|[ ._-]+)/i, "").trim();
    title = title.replace(/[._-]/g, " ");
    return title.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()).trim();
  }
}
