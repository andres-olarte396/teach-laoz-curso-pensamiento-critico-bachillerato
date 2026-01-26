import { IContentRepository } from '../../domain/repositories/IContentRepository.js';
import { MarkdownEvaluationParser } from '../../infrastructure/services/MarkdownEvaluationParser.js';
import { Evaluation } from '../../domain/entities/Evaluation.js';
import { ContentNotFoundError } from '../errors/DomainError.js';
import { IMarkdownRenderer } from '../../domain/services/IMarkdownRenderer.js';

/**
 * Caso de Uso: Obtener Evaluación
 * Lee un archivo Markdown del repositorio y lo transforma en una entidad Evaluation.
 */
export class GetEvaluation {
  private readonly parser: MarkdownEvaluationParser;

  constructor(
    private readonly contentRepository: IContentRepository,
    markdownRenderer: IMarkdownRenderer
  ) {
    this.parser = new MarkdownEvaluationParser(markdownRenderer);
  }

  async execute(path: string): Promise<Evaluation> {
    const exists = await this.contentRepository.exists(path);
    if (!exists) {
      throw new ContentNotFoundError(`Evaluation not found at path: ${path}`);
    }

    const content = await this.contentRepository.getFile(path);
    // Convert Buffer to string if necessary
    const markdown = typeof content === 'string' ? content : content.toString('utf-8');

    return this.parser.parse(path, markdown);
  }
}
