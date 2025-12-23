import { IContentRepository } from '@domain/repositories/IContentRepository.js';
import { ContentDto } from '@application/dtos/ContentDto.js';
import { ContentPath } from '@domain/value-objects/ContentPath.js';
import { ContentNotFoundError } from '@application/errors/DomainError.js';
import { ContentType } from '@domain/value-objects/ContentType.js';

export class GetContent {
  constructor(private readonly contentRepository: IContentRepository) {}

  async execute(path: string): Promise<ContentDto> {
    const contentPath = ContentPath.create(path);
    const pathStr = contentPath.toString();

    const exists = await this.contentRepository.exists(pathStr);
    if (!exists) {
      throw new ContentNotFoundError(`Content not found at path: ${pathStr}`);
    }

    const isDirectory = await this.contentRepository.isDirectory(pathStr);
    if (isDirectory) {
      // In Clean Architecture, GetContent usually refers to a file. 
      // For directories, ListContent should be used.
      // However, we can return some metadata if needed.
      throw new Error('Use ListContent for directories');
    }

    const content = await this.contentRepository.getFile(pathStr);
    const metadata = await this.contentRepository.getMetadata(pathStr);

    // Extraction of name from path
    const name = pathStr.split('/').pop() || '';
    const extension = name.includes('.') ? name.split('.').pop() : undefined;

    return {
      path: pathStr,
      name,
      type: ContentType.BINARY, // Temporary, should be refined
      extension,
      content,
      metadata: {
        size: metadata.size,
        lastModified: metadata.lastModified?.toISOString(),
        mimeType: metadata.mimeType,
      },
    };
  }
}
