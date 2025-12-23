import { describe, it, expect } from 'vitest';
import { UnifiedMarkdownRenderer } from '../../src/infrastructure/services/UnifiedMarkdownRenderer.js';

describe('UnifiedMarkdownRenderer Integration', () => {
  const renderer = new UnifiedMarkdownRenderer();

  it('should render basic markdown to HTML', async () => {
    const markdown = '# Hello\n\nThis is a test.';
    const html = await renderer.render(markdown);
    expect(html).toContain('id="hello"');
    expect(html).toContain('href="#hello"');
    expect(html).toContain('Hello</a></h1>');
    expect(html).toContain('<p>This is a test.</p>');
  });

  it('should parse frontmatter', async () => {
    const markdown = '---\ntitle: Test Title\norder: 1\n---\n# Content';
    const result = await renderer.renderWithMeta(markdown);
    expect(result.frontmatter?.title).toBe('Test Title');
    expect(result.frontmatter?.order).toBe(1);
  });

  it('should render math formulas', async () => {
    const markdown = '$E = mc^2$';
    const html = await renderer.render(markdown);
    expect(html).toContain('katex');
    expect(html).toContain('math');
  });

  it('should highlight code blocks', async () => {
    const markdown = '```typescript\nconst x = 1;\n```';
    const html = await renderer.render(markdown);
    expect(html).toContain('hljs');
    expect(html).toContain('language-typescript');
  });
});
