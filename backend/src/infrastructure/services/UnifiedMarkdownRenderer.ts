import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkRehype from 'remark-rehype';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeStringify from 'rehype-stringify';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import remarkFrontmatter from 'remark-frontmatter';
import YAML from 'yaml';
import { IMarkdownRenderer, RenderOptions, RenderResult, TocItem } from '../../domain/services/IMarkdownRenderer.js';
import { env } from '../config/environment.js';

export class UnifiedMarkdownRenderer implements IMarkdownRenderer {
  async render(markdown: string, options?: RenderOptions): Promise<string> {
    const result = await this.renderWithMeta(markdown, options);
    return result.html;
  }

  async renderWithMeta(markdown: string, _options?: RenderOptions): Promise<RenderResult> {
    let frontmatter: Record<string, any> = {};
    const processor = unified()
      .use(remarkParse)
      .use(remarkFrontmatter, ['yaml'])
      .use(() => (tree: any) => {
        const yamlNode = tree.children.find((node: any) => node.type === 'yaml');
        if (yamlNode) {
          try {
            frontmatter = YAML.parse(yamlNode.value);
          } catch (e) {
            console.error('Error parsing frontmatter:', e);
          }
        }
      })
      .use(remarkGfm)
      .use(remarkMath)
      .use(remarkRehype, { allowDangerousHtml: env.MARKDOWN_ALLOW_HTML })
      .use(rehypeHighlight)
      .use(rehypeKatex)
      .use(rehypeSlug)
      .use(rehypeAutolinkHeadings, { behavior: 'wrap' });

    if (env.MARKDOWN_SANITIZE) {
      processor.use(rehypeSanitize, {
        ...defaultSchema,
        tagNames: [...(defaultSchema.tagNames || []), 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'math', 'annotation', 'semantics', 'mrow', 'msup', 'msub', 'mover', 'munder', 'mfrac', 'msqrt', 'root', 'mi', 'mo', 'mn', 'mtext', 'mspace'],
        attributes: {
          ...defaultSchema.attributes,
          '*': ['className', 'id'],
          code: [
            ...(defaultSchema.attributes?.code || []),
            ['className', /^language-./, 'hljs'],
          ],
          div: [
            ...(defaultSchema.attributes?.div || []),
            ['className', 'mermaid'],
          ],
        },
      });
    }

    processor.use(rehypeStringify);

    const result = await processor.process(markdown);
    
    // Simple TOC extraction (can be improved with a dedicated plugin)
    const toc: TocItem[] = []; // Implementation of TOC extraction would go here

    return {
      html: result.toString(),
      frontmatter,
      toc,
    };
  }
}
