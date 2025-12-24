import fs from 'fs/promises';
import path from 'path';
import { IContentRepository } from '../../domain/repositories/IContentRepository.js';
import { ContentNode, ContentMetadata } from '../../domain/entities/ContentNode.js';
import { ContentType } from '../../domain/value-objects/ContentType.js';
import { env } from '../config/environment.js';
import { logger } from '../../shared/logger/logger.js';

export class LocalFileSystemRepository implements IContentRepository {
  private readonly basePath: string;

  constructor() {
    this.basePath = path.resolve(env.CONTENT_BASE_PATH);
  }

  async list(relativePath: string): Promise<ContentNode[]> {
    const fullPath = this.resolvePath(relativePath);
    const entries = await fs.readdir(fullPath, { withFileTypes: true });

    const nodes = await Promise.all(
      entries.map(async (entry) => {
        const entryRelativePath = path.join(relativePath, entry.name).replace(/\\/g, '/');
        const type = entry.isDirectory() ? ContentType.DIRECTORY : this.detectType(entry.name);
        const stats = await fs.stat(path.join(fullPath, entry.name));

        return ContentNode.create(
          entryRelativePath,
          entry.name,
          type,
          path.extname(entry.name).slice(1),
          {
            size: stats.size,
            lastModified: stats.mtime,
          }
        );
      })
    );

    return nodes;
  }

  async getFile(relativePath: string): Promise<Buffer | string> {
    const fullPath = this.resolvePath(relativePath);
    const type = this.detectType(relativePath);

    if (type === ContentType.MARKDOWN) {
      return await fs.readFile(fullPath, 'utf8');
    }

    return await fs.readFile(fullPath);
  }

  async exists(relativePath: string): Promise<boolean> {
    try {
      await fs.access(this.resolvePath(relativePath));
      return true;
    } catch {
      return false;
    }
  }

  async isDirectory(relativePath: string): Promise<boolean> {
    const stats = await fs.stat(this.resolvePath(relativePath));
    return stats.isDirectory();
  }

  async getMetadata(relativePath: string): Promise<ContentMetadata> {
    const fullPath = this.resolvePath(relativePath);
    const stats = await fs.stat(fullPath);
    // Simple MIME type detection based on extension for now
    const ext = path.extname(relativePath).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.md': 'text/markdown',
      '.html': 'text/html',
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.svg': 'image/svg+xml',
      '.mp4': 'video/mp4',
      '.webm': 'video/webm',
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav',
      '.ogg': 'audio/ogg',
    };

    return {
      size: stats.size,
      lastModified: stats.mtime,
      mimeType: mimeTypes[ext] || 'application/octet-stream',
    };
  }

  private resolvePath(relativePath: string): string {
    const resolved = path.resolve(this.basePath, relativePath);
    if (!resolved.startsWith(this.basePath)) {
      logger.warn({ relativePath, resolved }, 'Tentativa de Path Traversal detectada');
      throw new Error('Access denied: Path is outside base directory');
    }
    return resolved;
  }

  private detectType(filename: string): ContentType {
    const ext = path.extname(filename).toLowerCase();
    if (ext === '.md') return ContentType.MARKDOWN;
    if (ext === '.html') return ContentType.HTML;
    return ContentType.BINARY;
  }
}
