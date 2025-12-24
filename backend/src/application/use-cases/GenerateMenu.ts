import { IContentRepository } from '../../domain/repositories/IContentRepository.js';
import { MenuDto, MenuItemDto } from '../dtos/MenuDto.js';
import { logger } from '../../shared/logger/logger.js';

export class GenerateMenu {
  constructor(private readonly contentRepository: IContentRepository) {}

  async execute(): Promise<MenuDto> {
    const rootNodes = await this.contentRepository.list('');
    
    // We filter only directories at root as "courses"
    const courses = (await Promise.all(
      rootNodes
        .filter(node => node.isDirectory())
        .map(async courseNode => this.buildMenuItem(courseNode.path.toString()))
    )).filter((item): item is MenuItemDto => item !== null);

    // logger.info({ courses }, 'Generated courses menu');
    return { courses };
  }

  private async buildMenuItem(path: string): Promise<MenuItemDto | null> {
    const name = path.split('/').pop() || '';
    const isDirectory = await this.contentRepository.isDirectory(path);
    
    const item: MenuItemDto = {
      id: name,
      title: this.formatTitle(name),
      path,
      type: isDirectory ? 'directory' : 'markdown',
    };

    if (isDirectory) {
      const childrenNodes = await this.contentRepository.list(path);
      
      const childrenPromises = childrenNodes
        .filter(node => {
          if (node.isDirectory()) return true;
          if (node.isMarkdown()) return true;
          if (node.isHtml()) return true;
          // Allow specific binary assets
          const allowedExtensions = ['pdf', 'mp4', 'mp3', 'wav', 'ogg'];
          return node.isBinary() && allowedExtensions.includes(node.extension?.toLowerCase() || '');
        })
        .map(node => this.buildMenuItem(node.path.toString()));

      const children = (await Promise.all(childrenPromises))
        .filter((child): child is MenuItemDto => child !== null);
      
      // If directory is empty after filtering, don't show it (unless it's a root node which we check differently, but here we enforce cleaner tree)
      // Actually, for a directory to be useful in a menu, it should have content.
      if (children.length === 0) {
        return null;
      }

      item.children = children;
    }

    if (name === '') {
       logger.warn({ path }, 'Empty name generated for path');
    }
    
    // Debug log for one problematic course
    if (path.includes('teach-laoz-curso-svg-creativos')) {
        // logger.info({ item }, 'Built menu item');
    }

    return item;
  }

  private formatTitle(name: string): string {
    // 1. Remove extension
    let title = name.replace(/\.[^/.]+$/, "");
    
    // 2. Remove prefix
    title = title.replace(/^teach-laoz-curso-/, "");
    
    // 3. Replace separators
    title = title.replace(/[-_]/g, " ");

    // 4. Title Case
    return title.replace(/\w\S*/g, (txt) => {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    }).trim();
  }
}
