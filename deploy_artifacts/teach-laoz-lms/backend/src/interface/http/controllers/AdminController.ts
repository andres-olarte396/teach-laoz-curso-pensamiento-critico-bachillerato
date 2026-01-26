import { FastifyRequest, FastifyReply } from 'fastify';
import { ExtractCourses } from '../../../application/use-cases/admin/ExtractCourses.js';

import { AddCourseRepository } from '../../../application/use-cases/admin/AddCourseRepository.js';
import { env } from '../../../infrastructure/config/environment.js';

export class AdminController {
  private readonly extractCoursesUseCase: ExtractCourses;
  private readonly addCourseRepositoryUseCase: AddCourseRepository;

  constructor() {
    this.extractCoursesUseCase = new ExtractCourses();
    this.addCourseRepositoryUseCase = new AddCourseRepository();
  }

  async extractCourses(_request: FastifyRequest, reply: FastifyReply) {
    try {
      const result = await this.extractCoursesUseCase.execute();
      return reply.send({
        success: true,
        message: 'Course extraction completed',
        data: result,
      });
    } catch (error: any) {
      return reply.status(500).send({
        success: false,
        message: error.message || 'Failed to extract courses',
      });
    }
  }

  async addRepository(request: FastifyRequest<{ Body: { name: string; url: string } }>, reply: FastifyReply) {
    const { name, url } = request.body;

    if (!name || !url) {
      return reply.status(400).send({
        success: false,
        message: 'Name and URL are required',
      });
    }

    try {
      await this.addCourseRepositoryUseCase.execute({ name, url });
      return reply.send({
        success: true,
        message: 'Repository added successfully',
      });
    } catch (error: any) {
      return reply.status(400).send({
        success: false,
        message: error.message || 'Failed to add repository',
      });
    }
  }

  async getConfig(_request: FastifyRequest, reply: FastifyReply) {
    return reply.send({
      success: true,
      data: {
        social: {
          github: env.GITHUB_URL,
          twitter: env.TWITTER_URL,
          linkedin: env.LINKEDIN_URL,
        },
      },
    });
  }
}
