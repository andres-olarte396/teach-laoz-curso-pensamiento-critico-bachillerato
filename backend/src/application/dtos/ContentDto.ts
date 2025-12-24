import { ContentType } from '../../domain/value-objects/ContentType.js';

export interface RelatedAsset {
  type: 'audio' | 'video' | 'exercise' | 'evaluation' | 'script';
  path: string;
  name: string; // The full filename or a display name
  url?: string; // Optional full URL if needed
}

export interface ContentDto {
  path: string;
  name: string;
  type: ContentType;
  extension?: string;
  content: string | Buffer;
  relatedAssets?: RelatedAsset[];
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
