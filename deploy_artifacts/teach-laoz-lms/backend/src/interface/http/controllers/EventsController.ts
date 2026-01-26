import { FastifyRequest, FastifyReply } from 'fastify';
import { TrackLearningEvent, TrackLearningEventDTO } from '../../../application/use-cases/TrackLearningEvent.js';
import { LogLearningEventRepository } from '../../../infrastructure/repositories/LogLearningEventRepository.js';

/**
 * Controlador para la gestión de eventos de aprendizaje.
 * Expone endpoints para recibir telemetría del frontend.
 */
export class EventsController {
  private readonly trackLearningEvent: TrackLearningEvent;

  constructor() {
    const repository = new LogLearningEventRepository();
    this.trackLearningEvent = new TrackLearningEvent(repository);
  }

  /**
   * Registra un nuevo evento de aprendizaje.
   * POST /events
   */
  async track(request: FastifyRequest<{ Body: TrackLearningEventDTO }>, reply: FastifyReply) {
    try {
      const dto = request.body;
      
      // Validación básica
      if (!dto.userId || !dto.courseId || !dto.type) {
        return reply.code(400).send({ message: 'Missing required fields: userId, courseId, type' });
      }

      await this.trackLearningEvent.execute(dto);
      
      return reply.code(201).send({ status: 'success' });
    } catch (error) {
      console.error('Error tracking learning event:', error);
      return reply.code(500).send({ message: 'Error tracking event' });
    }
  }
}
