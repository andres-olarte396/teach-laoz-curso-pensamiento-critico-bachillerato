import { describe, it, expect, vi } from 'vitest';
import { RenderMarkdown } from '../../../src/application/use-cases/RenderMarkdown.js';
import { GetContent } from '../../../src/application/use-cases/GetContent.js';
import { IMarkdownRenderer } from '../../../src/domain/services/IMarkdownRenderer.js';
import { ContentType } from '../../../src/domain/value-objects/ContentType.js';

describe('RenderMarkdown', () => {
  it('should render markdown content successfully', async () => {
    // Arrange
    const mockGetContent = {
      execute: vi.fn().mockResolvedValue({
        path: 'test.md',
        name: 'test.md',
        type: ContentType.BINARY,
        content: '# Hello World',
        metadata: {},
      }),
    } as unknown as GetContent;

    const mockRenderer: IMarkdownRenderer = {
      render: vi.fn(),
      renderWithMeta: vi.fn().mockResolvedValue({
        html: '<h1>Hello World</h1>',
        frontmatter: { title: 'Hello' },
        toc: [{ id: 'hello', level: 1, text: 'Hello' }],
      }),
    };

    const useCase = new RenderMarkdown(mockGetContent, mockRenderer);

    // Act
    const result = await useCase.execute('test.md');

    // Assert
    expect(result.html).toBe('<h1>Hello World</h1>');
    expect(result.frontmatter.title).toBe('Hello');
    expect(result.type).toBe(ContentType.MARKDOWN);
    expect(mockRenderer.renderWithMeta).toHaveBeenCalledWith('# Hello World');
  });
});
