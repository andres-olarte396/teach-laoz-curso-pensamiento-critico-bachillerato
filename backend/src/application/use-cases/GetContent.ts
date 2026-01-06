import { IContentRepository } from '../../domain/repositories/IContentRepository.js';
import { ContentDto } from '../dtos/ContentDto.js';
import { ContentPath } from '../../domain/value-objects/ContentPath.js';
import { ContentNotFoundError } from '../errors/DomainError.js';
import { ContentType } from '../../domain/value-objects/ContentType.js';

export class GetContent {
  constructor(private readonly contentRepository: IContentRepository) {}

  async execute(path: string): Promise<ContentDto> {
    const contentPath = ContentPath.create(path);
    const pathStr = contentPath.toString();

    // console.time(`GetContent-${pathStr}`);
    const exists = await this.contentRepository.exists(pathStr);
    if (!exists) {
      throw new ContentNotFoundError(`Content not found at path: ${pathStr}`);
    }

    const isDirectory = await this.contentRepository.isDirectory(pathStr);
    if (isDirectory) {
      // Auto-resolve directory to index file
      const indexFiles = ['INDICE.md', 'index.md', 'README.md'];
      for (const indexFile of indexFiles) {
        const indexPath = `${pathStr}/${indexFile}`.replace(/\/+/g, '/');
        if (await this.contentRepository.exists(indexPath)) {
          return this.execute(indexPath);
        }
      }
      
      throw new Error('Use ListContent for directories');
    }

    // console.timeLog(`GetContent-${pathStr}`, 'File Resolved');
    const content = await this.contentRepository.getFile(pathStr);
    // console.timeLog(`GetContent-${pathStr}`, 'File Read');
    const metadata = await this.contentRepository.getMetadata(pathStr);
    // console.timeLog(`GetContent-${pathStr}`, 'Metadata Read');

    // Extraction of name from path
    const name = pathStr.split('/').pop() || '';
    const extension = name.includes('.') ? name.split('.').pop() : undefined;
    const baseName = name.replace(/\.[^/.]+$/, ''); // Remove extension
    
    // 3. Smart Asset Detection (Only for instructional content: Markdown/HTML)
    const relatedAssets: any[] = [];
    const mime = metadata.mimeType || '';
    const isInstructional = mime.includes('text/') || mime === 'application/json'; // covering md, html, json

    if (isInstructional) {
        // console.timeLog(`GetContent-${pathStr}`, 'Starting Asset Scan');
        const parentDir = pathStr.split('/').slice(0, -1).join('/') || '';
        
        try {
        let smartBaseName = baseName;
        if (baseName.endsWith('_contenido')) {
            smartBaseName = baseName.replace('_contenido', '');
        }
        
        const siblings = await this.contentRepository.list(parentDir);
        // console.timeLog(`GetContent-${pathStr}`, `Listed ${siblings.length} siblings`);
        
        for (const sibling of siblings) {
            if (sibling.name === name) continue; // Skip self

            const siblingBaseName = sibling.name.replace(/\.[^/.]+$/, '');

            if (siblingBaseName.startsWith(smartBaseName)) {
                const suffix = siblingBaseName.slice(smartBaseName.length);
                if (['_ex', '_ejercicio', '_ejercicios', '-ex', '-ejercicio', '-ejercicios'].includes(suffix.toLowerCase())) {
                    relatedAssets.push({ type: 'exercise', path: sibling.path.toString(), name: sibling.name });
                } 
                else if (['_eval', '_evaluacion', '_test', '-eval', '-evaluacion'].includes(suffix.toLowerCase())) {
                    relatedAssets.push({ type: 'evaluation', path: sibling.path.toString(), name: sibling.name });
                }
                else if (['_guion', '_script', '-guion', '-script'].includes(suffix.toLowerCase())) {
                    relatedAssets.push({ type: 'script', path: sibling.path.toString(), name: sibling.name });
                }
            }
        }

        // 4. Parallel Look for Media (Audio/Video)
        const normalizedPath = pathStr.replace(/\\/g, '/');
        const parts = normalizedPath.split('/');
        const potentialMediaRoots = [
            parts.slice(0, -2).join('/'), // ../
            parts.slice(0, -3).join('/')  // ../../
        ];

        const extensions = ['wav', 'mp3', 'ogg', 'm4a'];
        const parentFolder = parts.at(-2) || '';
        const namesToCheck = [
            smartBaseName, 
            baseName,
            `${parentFolder}_${smartBaseName}`,
            `${parentFolder}_${baseName}`
        ];

        // Generate all candidate paths
        const candidates: { path: string, name: string }[] = [];
        
        for (const root of potentialMediaRoots) {
            const mediaPathsToCheck = [`${root}/media`, `${root}/media/media`];
            for (const mediaPath of mediaPathsToCheck) {
                for (const potentialName of namesToCheck) {
                    for (const ext of extensions) {
                         candidates.push({
                            path: `${mediaPath}/${potentialName}.${ext}`,
                            name: `${potentialName}.${ext}`
                         });
                    }
                }
            }
        }

        // Check all in parallel
        // console.timeLog(`GetContent-${pathStr}`, `Checking ${candidates.length} media candidates`);
        const existenceResults = await Promise.all(
            candidates.map(async (c) => {
                const exists = await this.contentRepository.exists(c.path);
                return exists ? c : null;
            })
        );
        // console.timeLog(`GetContent-${pathStr}`, 'Media Check Done');
        
        const foundMedia = existenceResults.find(r => r !== null);
        if (foundMedia) {
             relatedAssets.push({
                type: 'audio',
                path: foundMedia.path,
                name: foundMedia.name
             });
        }

        } catch (error) {
        console.warn(`Failed to scan for related assets in ${parentDir}`, error);
        }
    }
    // console.timeEnd(`GetContent-${pathStr}`);

    return {
      path: pathStr,
      name,
      type: metadata.mimeType === 'text/markdown' ? ContentType.MARKDOWN : 
            metadata.mimeType === 'text/html' ? ContentType.HTML : 
            ContentType.BINARY, 
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
