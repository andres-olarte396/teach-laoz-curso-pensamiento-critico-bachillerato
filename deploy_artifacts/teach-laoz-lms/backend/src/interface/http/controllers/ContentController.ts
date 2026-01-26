import { FastifyReply, FastifyRequest } from 'fastify';
import { ListContent } from '../../../application/use-cases/ListContent.js';
import { GetContent } from '../../../application/use-cases/GetContent.js';
import { RenderMarkdown } from '../../../application/use-cases/RenderMarkdown.js';
import { GenerateMenu } from '../../../application/use-cases/GenerateMenu.js';
import { LocalFileSystemRepository } from '../../../infrastructure/repositories/LocalFileSystemRepository.js';
import { UnifiedMarkdownRenderer } from '../../../infrastructure/services/UnifiedMarkdownRenderer.js';
import { FileSystemCourseRepository } from '../../../infrastructure/repositories/FileSystemCourseRepository.js';
import { GetEvaluation } from '../../../application/use-cases/GetEvaluation.js';
import { env } from '../../../infrastructure/config/environment.js';
import path from 'path';

export class ContentController {
  private readonly listContent: ListContent;
  private readonly getContent: GetContent;
  private readonly renderMarkdown: RenderMarkdown;
  private readonly generateMenu: GenerateMenu;
  private readonly getEvaluationUseCase: GetEvaluation;
  private readonly courseRepository: FileSystemCourseRepository;

  constructor() {
    // Dependency Injection (Manually for now, could use a container later)
    const repository = new LocalFileSystemRepository();
    const markdownRenderer = new UnifiedMarkdownRenderer();
    
    this.listContent = new ListContent(repository);
    this.getContent = new GetContent(repository);
    this.renderMarkdown = new RenderMarkdown(this.getContent, markdownRenderer);
    this.generateMenu = new GenerateMenu(repository);
    this.getEvaluationUseCase = new GetEvaluation(repository, markdownRenderer);
    
    // The CONTENT_BASE_PATH is usually ./content/courses
    this.courseRepository = new FileSystemCourseRepository(path.resolve(env.CONTENT_BASE_PATH));
  }

  async getMenu(_request: FastifyRequest, reply: FastifyReply) {
    const menu = await this.generateMenu.execute();
    return reply.send(menu);
  }

  async listCourses(_request: FastifyRequest, reply: FastifyReply) {
    const courses = await this.courseRepository.listAll();
    return reply.send({ courses });
  }

  async getContentByPath(request: FastifyRequest<{ Params: { '*': string } }>, reply: FastifyReply) {
    const path = request.params['*'] || '';
    
    // Check if it's a directory or a file
    // Ideally the use case handles this or we have a flag
    // For now, let's try reading as content, if it fails because it's a directory, list it.
    
    try {
      const lowerPath = path.toLowerCase();
      
      if (lowerPath.endsWith('.md')) {
        const result = await this.renderMarkdown.execute(path);
        return reply.send(result);
      }
      
      if (lowerPath.endsWith('.html')) {
        const result = await this.getContent.execute(path);
        return reply.send({
          ...result,
          html: result.content
        });
      }
      
      const result = await this.getContent.execute(path);
      return reply.send(result);
    } catch (error) {
      if (error instanceof Error && error.message.includes('Use ListContent for directories')) {
        const result = await this.listContent.execute(path);
        return reply.send(result);
      }
      throw error;
    }
  }

  async getEvaluation(request: FastifyRequest<{ Params: { '*': string } }>, reply: FastifyReply) {
    const path = request.params['*'] || '';
    try {
      const evaluation = await this.getEvaluationUseCase.execute(path);
      return reply.send(evaluation);
    } catch (error) {
      return reply.code(404).send({ message: 'Evaluation not found or malformed' });
    }
  }
}
