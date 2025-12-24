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
    const baseName = name.replace(/\.[^/.]+$/, ''); // Remove extension
    
    // Scan for related assets
    const parentDir = pathStr.split('/').slice(0, -1).join('/') || '';
    const relatedAssets: any[] = []; // Use any for now, strictly matches DTO in controller

    try {
      const siblings = await this.contentRepository.list(parentDir);
      
      for (const sibling of siblings) {
        if (sibling.name === name) continue; // Skip self

        const siblingExt = sibling.name.split('.').pop()?.toLowerCase();
        const siblingBaseName = sibling.name.replace(/\.[^/.]+$/, '');

        // 1. Audio/Video check (Same base name, different extension)
        if (siblingBaseName === baseName) {
           if (['mp3', 'wav', 'ogg', 'm4a'].includes(siblingExt || '')) {
             relatedAssets.push({
               type: 'audio',
               path: sibling.path.toString(),
               name: sibling.name
             });
           } else if (['mp4', 'webm', 'mov'].includes(siblingExt || '')) {
             relatedAssets.push({
               type: 'video',
               path: sibling.path.toString(),
               name: sibling.name
             });
           }
        }

        // 2. Exercise/Evaluation check (Suffix check)
        // Checks for: basename_ex.md, basename_ejercicio.md, basename_eval.md, etc.
        if (sibling.name.startsWith(baseName) && (siblingExt === 'md' || siblingExt === undefined)) {
            const suffix = siblingBaseName.slice(baseName.length);
            
            if (['_ex', '_ejercicio', '-ex', '-ejercicio'].includes(suffix.toLowerCase())) {
                relatedAssets.push({
                    type: 'exercise',
                    path: sibling.path.toString(),
                    name: sibling.name
                });
            } else if (['_eval', '_evaluacion', '_test', '-eval', '-evaluacion'].includes(suffix.toLowerCase())) {
                relatedAssets.push({
                    type: 'evaluation',
                    path: sibling.path.toString(),
                    name: sibling.name
                });
            }
        }
      }
    } catch (error) {
       console.warn(`Failed to scan for related assets in ${parentDir}`, error);
       // Non-blocking error
    }

    return {
      path: pathStr,
      name,
      type: ContentType.BINARY, // Temporary, should be refined
      extension,
      content,
      relatedAssets,
      metadata: {
        size: metadata.size,
        lastModified: metadata.lastModified?.toISOString(),
        mimeType: metadata.mimeType,
      },
    };
  }
}
