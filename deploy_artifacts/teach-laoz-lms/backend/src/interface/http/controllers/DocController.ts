import { FastifyRequest, FastifyReply } from 'fastify';
import { UnifiedMarkdownRenderer } from '../../../infrastructure/services/UnifiedMarkdownRenderer.js';
import { env } from '../../../infrastructure/config/environment.js';
import path from 'path';
import fs from 'fs/promises';
import { existsSync } from 'fs';

export class DocController {
  private readonly renderer: UnifiedMarkdownRenderer;
  private readonly docsPath: string;

  constructor() {
    this.renderer = new UnifiedMarkdownRenderer();
    
    // Robust path resolution for documentation
    // Prioritize absolute path for local environment as confirmed by 'dir'
    let resolvedPath = 'E:\\MyRepos\\education\\teach-laoz-learning-management-system\\content\\docs';
    
    if (!existsSync(resolvedPath)) {
      resolvedPath = path.resolve('content/docs');
    }
    
    if (!existsSync(resolvedPath)) {
      resolvedPath = path.resolve('../content/docs');
    }
    
    // Final fallback for docker environments
    if (!existsSync(resolvedPath)) {
       resolvedPath = '/app/content/docs';
    }

    this.docsPath = resolvedPath;
    console.log(`[DocController] Docs path initialized at: ${this.docsPath}`);
  }

  async getDoc(request: FastifyRequest<{ Params: { category: string, docId: string } }>, reply: FastifyReply) {
    const { category, docId } = request.params;
    
    try {
      const filePath = path.join(this.docsPath, category, `${docId}.md`);
      console.log(`[DocController] Fetching document: ${filePath}`);
      
      if (!existsSync(filePath)) {
        console.warn(`[DocController] Document not found: ${filePath}`);
        return reply.code(404).send({ message: 'Document not found' });
      }

      const fileContent = await fs.readFile(filePath, 'utf-8');
      
      // Simple parse to remove frontmatter if it exists (for consistency with courses)
      const cleanContent = fileContent.replace(/^---\r?\n([\s\S]*?)\r?\n---\s*?\r?\n/, '');
      
      const html = await this.renderer.render(cleanContent);
      
      return reply.send({
        category,
        id: docId,
        html
      });
    } catch (error) {
      console.error('Error reading doc:', error);
      return reply.code(500).send({ message: 'Internal server error reading document' });
    }
  }
}
