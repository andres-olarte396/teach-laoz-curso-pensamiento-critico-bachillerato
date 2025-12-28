import { IContentRepository } from '../../domain/repositories/IContentRepository.js';
import { MenuDto, MenuItemDto } from '../dtos/MenuDto.js';
import { ContentNode } from '../../domain/entities/ContentNode.js';

export class GenerateMenu {
  constructor(private readonly contentRepository: IContentRepository) {}

  async execute(): Promise<MenuDto> {
    const rootNodes = await this.contentRepository.list('');
    
    // We filter only directories at root as "courses", excluding specific restricted ones like "blog"
    const courses = (await Promise.all(
      rootNodes
        .filter(node => node.isDirectory() && node.name.toLowerCase() !== 'blog')
        .map(async courseNode => this.buildMenuItem(courseNode))
    )).filter((item): item is MenuItemDto => item !== null);

    return { courses };
  }

  private async buildMenuItem(node: ContentNode): Promise<MenuItemDto | null> {
    const path = node.path.toString();
    const isDirectory = node.isDirectory();
    
    const item: MenuItemDto = {
      id: node.name,
      title: this.formatTitle(node.name),
      path,
      type: isDirectory ? 'directory' : node.type as any,
    };

    if (isDirectory) {
      const childrenNodes = await this.contentRepository.list(path);
      
      const childrenPromises = childrenNodes
        .filter(n => {
          if (n.isDirectory()) return true;
          if (n.isMarkdown()) return true;
          if (n.isHtml()) return true;
          // Allow specific binary assets
          const allowedExtensions = ['pdf', 'mp4', 'mp3', 'wav', 'ogg'];
          return n.isBinary() && allowedExtensions.includes(n.extension?.toLowerCase() || '');
        })
        .map(n => this.buildMenuItem(n));

      const children = (await Promise.all(childrenPromises))
        .filter((child): child is MenuItemDto => child !== null);
      
      if (children.length === 0) {
        return null;
      }

      item.children = children;
    }

    return item;
  }

  private formatTitle(name: string): string {
    // 1. Remove extension
    let title = name.replace(/\.[^/.]+$/, "");
    
    // 2. Aggressive multi-pass cleaning of prefixes at the start
    // Removes any combination of "teach", "laoz", "curso" and common separators at the beginning
    const originalTitle = title;
    let prevTitle;
    do {
      prevTitle = title;
      title = title.replace(/^(teach|laoz|curso|learning|system|courses?|educacion|[ ._-]+)/i, "").trim();
    } while (title !== prevTitle && title.length > 0);
    
    // Fallback if cleaning removed everything
    if (title.length === 0) {
        title = originalTitle;
    }
    
    // 3. Replace remaining separators with spaces
    title = title.replace(/[._-]/g, " ");

    // 4. Title Case
    return title.replace(/\w\S*/g, (txt) => {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    }).trim();
  }
}
