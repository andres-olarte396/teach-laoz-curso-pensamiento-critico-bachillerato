import { LearningEvent, LearningEventType } from '../../domain/entities/LearningEvent.js';
import { ILearningEventRepository } from '../../domain/repositories/ILearningEventRepository.js';

export interface TrackLearningEventDTO {
  userId: string;
  organizationId: string;
  courseId: string;
  lessonId?: string;
  type: LearningEventType;
  metadata?: Record<string, any>;
}

/**
 * Caso de Uso: Registrar Evento de Aprendizaje
 * Se encarga de validar y persistir un evento capturado desde el exterior (frontend).
 */
export class TrackLearningEvent {
  constructor(private readonly eventRepository: ILearningEventRepository) {}

  async execute(dto: TrackLearningEventDTO): Promise<void> {
    // 1. Crear la entidad a partir del DTO
    const event = LearningEvent.create({
      userId: dto.userId,
      organizationId: dto.organizationId,
      courseId: dto.courseId,
      lessonId: dto.lessonId,
      type: dto.type,
      metadata: dto.metadata,
    });

    // 2. Persistir el evento
    await this.eventRepository.save(event);
  }
}
