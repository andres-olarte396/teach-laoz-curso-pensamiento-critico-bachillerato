import { ContentType } from '../../domain/value-objects/ContentType.js';

export interface ContentItemDto {
  path: string;
  name: string;
  type: ContentType;
  extension?: string;
  size?: number;
  lastModified?: string;
}

export interface ContentListDto {
  path: string;
  items: ContentItemDto[];
}
