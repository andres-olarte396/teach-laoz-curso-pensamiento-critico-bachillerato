import { IContentRepository } from '@domain/repositories/IContentRepository.js';
import { MenuDto, MenuItemDto } from '@application/dtos/MenuDto.js';

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

    return { courses };
  }

  private async buildMenuItem(path: string): Promise<MenuItemDto> {
    const name = path.split('/').pop() || '';
    const isDirectory = await this.contentRepository.isDirectory(path);
    
    const item: MenuItemDto = {
      id: name,
      title: name, // Should ideally come from metadata/frontmatter
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

    return item;
  }
}
