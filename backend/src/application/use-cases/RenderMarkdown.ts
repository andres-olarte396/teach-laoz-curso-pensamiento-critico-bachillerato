import { GetContent } from './GetContent.js';
import { IMarkdownRenderer } from '@domain/services/IMarkdownRenderer.js';
import { RenderedContentDto } from '@application/dtos/ContentDto.js';
import { ContentType } from '@domain/value-objects/ContentType.js';
import { RenderError } from '@application/errors/DomainError.js';

export class RenderMarkdown {
  constructor(
    private readonly getContent: GetContent,
    private readonly markdownRenderer: IMarkdownRenderer
  ) {}

  async execute(path: string): Promise<RenderedContentDto> {
    const rawContent = await this.getContent.execute(path);

    if (typeof rawContent.content !== 'string') {
      throw new RenderError('Cannot render binary content as markdown');
    }

    try {
      const result = await this.markdownRenderer.renderWithMeta(rawContent.content);

      return {
        ...rawContent,
        type: ContentType.MARKDOWN,
        html: result.html,
        frontmatter: result.frontmatter || {},
        toc: result.toc || [],
      };
    } catch (error) {
      throw new RenderError(`Error rendering markdown at path ${path}: ${(error as Error).message}`);
    }
  }
}
