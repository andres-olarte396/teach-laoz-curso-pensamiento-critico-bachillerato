import { FastifyReply, FastifyRequest } from 'fastify';
import { DomainError, ContentNotFoundError, InvalidPathError, RenderError } from '../../../application/errors/DomainError.js';
import { logger } from '../../../shared/logger/logger.js';

export const errorHandler = (error: Error, _request: FastifyRequest, reply: FastifyReply) => {
  logger.error(error);

  if (error instanceof ContentNotFoundError) {
    return reply.status(404).send({
      error: 'Not Found',
      message: error.message,
      code: 'CONTENT_NOT_FOUND',
    });
  }

  if (error instanceof InvalidPathError) {
    return reply.status(400).send({
      error: 'Bad Request',
      message: error.message,
      code: 'INVALID_PATH',
    });
  }

  if (error instanceof RenderError) {
    return reply.status(500).send({
      error: 'Internal Server Error',
      message: 'Failed to render content',
      code: 'RENDER_ERROR',
      details: error.message,
    });
  }

  if (error instanceof DomainError) {
    return reply.status(400).send({
      error: 'Domain Error',
      message: error.message,
      code: 'DOMAIN_ERROR',
    });
  }

  // Fastify validation errors
  if ((error as any).validation) {
    return reply.status(400).send({
      error: 'Validation Error',
      message: error.message,
      details: (error as any).validation,
    });
  }

  return reply.status(500).send({
    error: 'Internal Server Error',
    message: 'An unexpected error occurred',
    code: 'INTERNAL_SERVER_ERROR',
  });
};
