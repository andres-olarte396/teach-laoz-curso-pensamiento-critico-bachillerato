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
    
    // 3. Smart Asset Detection
    const parentDir = pathStr.split('/').slice(0, -1).join('/') || '';
    const relatedAssets: any[] = []; 


    try {
      // Logic: If current file is "topic_contenido.md", base is "topic".
      // We look for "topic_guion.md", "topic_ejercicios.md", "topic_evaluacion.md"
      let smartBaseName = baseName;
      if (baseName.endsWith('_contenido')) {
          smartBaseName = baseName.replace('_contenido', '');
      }
      
      // console.log(`[GetContent] Scanning for assets. Base: ${smartBaseName}, Parent: ${parentDir}`);

      const siblings = await this.contentRepository.list(parentDir);
      // console.log(`[GetContent] Found ${siblings.length} siblings in ${parentDir}`);
      
      for (const sibling of siblings) {
        if (sibling.name === name) continue; // Skip self

        const siblingBaseName = sibling.name.replace(/\.[^/.]+$/, '');

        // Match base name (e.g. "topic_guion" vs "topic")
        if (siblingBaseName.startsWith(smartBaseName)) {
             const suffix = siblingBaseName.slice(smartBaseName.length);
             
             // Exercises
             if (['_ex', '_ejercicio', '_ejercicios', '-ex', '-ejercicio', '-ejercicios'].includes(suffix.toLowerCase())) {
                 relatedAssets.push({ type: 'exercise', path: sibling.path.toString(), name: sibling.name });
             } 
             // Evaluations
             else if (['_eval', '_evaluacion', '_test', '-eval', '-evaluacion'].includes(suffix.toLowerCase())) {
                 relatedAssets.push({ type: 'evaluation', path: sibling.path.toString(), name: sibling.name });
             }
             // Scripts (Guion)
             else if (['_guion', '_script', '-guion', '-script'].includes(suffix.toLowerCase())) {
                 relatedAssets.push({ type: 'script', path: sibling.path.toString(), name: sibling.name });
             }
        }
      }

      // 4. Look for Media (Audio/Video) in Course Root "media" folder
      const normalizedPath = pathStr.replace(/\\/g, '/');
      const parts = normalizedPath.split('/');
      const potentialMediaRoots = [
          parts.slice(0, -2).join('/'), // ../
          parts.slice(0, -3).join('/')  // ../../
      ];

      for (const root of potentialMediaRoots) {
          const mediaPathsToCheck = [`${root}/media`, `${root}/media/media`];
          
          for (const mediaPath of mediaPathsToCheck) {
              const extensions = ['wav', 'mp3', 'ogg', 'm4a'];
              const parentFolder = parts.at(-2) || '';
              const namesToCheck = [
                  smartBaseName, 
                  baseName,
                  `${parentFolder}_${smartBaseName}`,
                  `${parentFolder}_${baseName}`
              ]; 
              

              for (const potentialName of namesToCheck) {
                  for (const ext of extensions) {
                      const audioPath = `${mediaPath}/${potentialName}.${ext}`;
                      const exists = await this.contentRepository.exists(audioPath);
                      if (exists) {
                          relatedAssets.push({
                              type: 'audio',
                              path: audioPath,
                              name: `${potentialName}.${ext}`
                          });
                          break; 
                      }
                  }
                  if (relatedAssets.find(a => a.type === 'audio')) break;
              }
              if (relatedAssets.find(a => a.type === 'audio')) break;
          }
           if (relatedAssets.find(a => a.type === 'audio')) break;
      }

    } catch (error) {
       console.warn(`Failed to scan for related assets in ${parentDir}`, error);
    }


    return {
      path: pathStr,
      name,
      type: ContentType.BINARY, 
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
