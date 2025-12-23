import { ContentType } from '@domain/value-objects/ContentType.js';

export interface ContentDto {
  path: string;
  name: string;
  type: ContentType;
  extension?: string;
  content: string | Buffer;
  metadata?: {
    size?: number;
    lastModified?: string;
    mimeType?: string;
    [key: string]: any;
  };
}

export interface RenderedContentDto extends ContentDto {
  html: string;
  frontmatter: Record<string, any>;
  toc: any[];
}
