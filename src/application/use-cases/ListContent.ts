import { IContentRepository } from '@domain/repositories/IContentRepository.js';
import { ContentListDto, ContentItemDto } from '@application/dtos/ContentListDto.js';
import { ContentPath } from '@domain/value-objects/ContentPath.js';

export class ListContent {
  constructor(private readonly contentRepository: IContentRepository) {}

  async execute(path: string): Promise<ContentListDto> {
    const contentPath = ContentPath.create(path);
    const nodes = await this.contentRepository.list(contentPath.toString());

    const items: ContentItemDto[] = nodes.map((node) => ({
      path: node.path.toString(),
      name: node.name,
      type: node.type,
      extension: node.extension,
      size: node.metadata?.size,
      lastModified: node.metadata?.lastModified?.toISOString(),
    }));

    return {
      path: contentPath.toString(),
      items,
    };
  }
}
