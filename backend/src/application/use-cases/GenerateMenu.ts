import { IContentRepository } from '@domain/repositories/IContentRepository.js';
import { MenuDto, MenuItemDto } from '@application/dtos/MenuDto.js';
import { logger } from '@shared/logger/logger.js';

export class GenerateMenu {
  constructor(private readonly contentRepository: IContentRepository) {}

  async execute(): Promise<MenuDto> {
    const rootNodes = await this.contentRepository.list('');
    
    // We filter only directories at root as "courses"
    const courses: MenuItemDto[] = await Promise.all(
      rootNodes
        .filter(node => node.isDirectory())
        .map(async courseNode => this.buildMenuItem(courseNode.path.toString()))
    );

    // logger.info({ courses }, 'Generated courses menu');
    return { courses };
  }

  private async buildMenuItem(path: string): Promise<MenuItemDto> {
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
      item.children = await Promise.all(
        childrenNodes
          .filter(node => node.isDirectory() || node.isMarkdown())
          .map(node => this.buildMenuItem(node.path.toString()))
      );
      
      // Sort children if needed (e.g., by order in frontmatter/filename)
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
