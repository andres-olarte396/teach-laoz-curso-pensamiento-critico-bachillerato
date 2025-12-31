import { LearningEvent } from '../entities/LearningEvent.js';

/**
 * Contrato para el repositorio de eventos de aprendizaje.
 * Define cómo se deben guardar o emitir los eventos capturados.
 */
export interface ILearningEventRepository {
  /**
   * Guarda un evento de aprendizaje de forma persistente.
   * @param event El evento a guardar.
   */
  save(event: LearningEvent): Promise<void>;
}
