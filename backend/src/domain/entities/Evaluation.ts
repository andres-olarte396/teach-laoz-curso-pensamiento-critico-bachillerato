/**
 * Estructura de una pregunta de evaluación.
 */
export interface Question {
  id: string;
  text: string;
  options: { id: string; text: string }[];
  correctAnswerId: string;
  feedback?: string;
}

/**
 * Entidad: Evaluación
 * Representa un conjunto de preguntas asociadas a una lección o curso.
 */
export class Evaluation {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly questions: Question[],
    public readonly type: 'quiz' | 'ai_open' = 'quiz',
    public readonly metadata: Record<string, any> = {}
  ) {}

  /**
   * Crea una instancia de Evaluation.
   */
  static create(id: string, title: string, questions: Question[], metadata?: Record<string, any>, type: 'quiz' | 'ai_open' = 'quiz'): Evaluation {
    return new Evaluation(id, title, questions, type, metadata);
  }

  /**
   * Convierte a objeto plano para serialización.
   */
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      type: this.type,
      questions: this.questions,
      metadata: this.metadata,
    };
  }
}
