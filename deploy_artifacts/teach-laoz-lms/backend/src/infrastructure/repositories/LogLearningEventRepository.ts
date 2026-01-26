import { LearningEvent } from '../../domain/entities/LearningEvent.js';
import { ILearningEventRepository } from '../../domain/repositories/ILearningEventRepository.js';

/**
 * Implementación de infraestructura: Repositorio de Logs
 * Escribe los eventos de aprendizaje en la consola (stdout).
 * Esta es una implementación inicial para telemetría antes de pasar a una base de datos.
 */
export class LogLearningEventRepository implements ILearningEventRepository {
  async save(event: LearningEvent): Promise<void> {
    const eventData = event.toJSON();
    
    // Log estructurado para fácil procesamiento por sistemas de logs (ej. ELK, CloudWatch)
    console.log(`[LEARNING_EVENT] ${JSON.stringify(eventData)}`);
  }
}
