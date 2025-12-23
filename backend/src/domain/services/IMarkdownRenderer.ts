/**
 * Opciones para el renderizado de Markdown
 */
export interface RenderOptions {
  sanitize?: boolean;
  allowHtml?: boolean;
  highlightCode?: boolean;
  parseFrontmatter?: boolean;
}

/**
 * Elemento de tabla de contenidos
 */
export interface TocItem {
  id: string;
  level: number;
  text: string;
}

/**
 * Resultado del renderizado con metadata
 */
export interface RenderResult {
  html: string;
  frontmatter?: Record<string, unknown>;
  toc?: TocItem[];
}

/**
 * Contrato del servicio de renderizado de Markdown
 */
export interface IMarkdownRenderer {
  /**
   * Renderiza Markdown a HTML
   * @param markdown Contenido en Markdown
   * @param options Opciones de renderizado
   */
  render(markdown: string, options?: RenderOptions): Promise<string>;

  /**
   * Renderiza Markdown con metadata adicional
   * @param markdown Contenido en Markdown
   * @param options Opciones de renderizado
   */
  renderWithMeta(markdown: string, options?: RenderOptions): Promise<RenderResult>;
}
