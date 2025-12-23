import { ContentPath } from '@domain/value-objects/ContentPath.js';
import { ContentType } from '@domain/value-objects/ContentType.js';

/**
 * Metadata adicional del contenido
 */
export interface ContentMetadata {
  size?: number;
  lastModified?: Date;
  mimeType?: string;
}

/**
 * Entidad: Nodo de contenido
 * Representa cualquier elemento en el árbol de contenido (carpeta, markdown, binario)
 */
export class ContentNode {
  constructor(
    public readonly path: ContentPath,
    public readonly name: string,
    public readonly type: ContentType,
    public readonly extension?: string,
    public readonly metadata?: ContentMetadata
  ) {}

  /**
   * Verifica si el nodo es un directorio
   */
  isDirectory(): boolean {
    return this.type === ContentType.DIRECTORY;
  }

  /**
   * Verifica si el nodo es un archivo Markdown
   */
  isMarkdown(): boolean {
    return this.type === ContentType.MARKDOWN;
  }

  /**
   * Verifica si el nodo es un archivo binario
   */
  isBinary(): boolean {
    return this.type === ContentType.BINARY;
  }

  /**
   * Verifica si el nodo es HTML estático
   */
  isHtml(): boolean {
    return this.type === ContentType.HTML;
  }

  /**
   * Crea un ContentNode desde datos básicos
   */
  static create(
    path: string,
    name: string,
    type: ContentType,
    extension?: string,
    metadata?: ContentMetadata
  ): ContentNode {
    return new ContentNode(ContentPath.create(path), name, type, extension, metadata);
  }

  /**
   * Convierte a un objeto plano para serialización
   */
  toJSON() {
    return {
      path: this.path.toString(),
      name: this.name,
      type: this.type,
      extension: this.extension,
      metadata: this.metadata,
    };
  }
}
