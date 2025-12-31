/**
 * Tipos de eventos de aprendizaje soportados.
 */
export type LearningEventType =
  | 'course_started'
  | 'lesson_viewed'
  | 'lesson_completed'
  | 'evaluation_started'
  | 'evaluation_submitted';

/**
 * Propiedades de un evento de aprendizaje.
 */
export interface LearningEventProps {
  userId: string;
  organizationId: string;
  courseId: string;
  lessonId?: string;
  type: LearningEventType;
  metadata?: Record<string, any>;
  timestamp: Date;
}

/**
 * Entidad: Evento de Aprendizaje
 * Representa una acción inmutable realizada por un estudiante.
 */
export class LearningEvent {
  constructor(private readonly props: LearningEventProps) {}

  get userId(): string { return this.props.userId; }
  get organizationId(): string { return this.props.organizationId; }
  get courseId(): string { return this.props.courseId; }
  get lessonId(): string | undefined { return this.props.lessonId; }
  get type(): LearningEventType { return this.props.type; }
  get metadata(): Record<string, any> | undefined { return this.props.metadata; }
  get timestamp(): Date { return this.props.timestamp; }

  /**
   * Crea una nueva instancia de LearningEvent asegurando valores por defecto.
   */
  static create(props: Omit<LearningEventProps, 'timestamp'> & { timestamp?: Date }): LearningEvent {
    return new LearningEvent({
      ...props,
      timestamp: props.timestamp || new Date(),
    });
  }

  /**
   * Convierte a objeto plano para persistencia o transmisión.
   */
  toJSON() {
    return {
      userId: this.userId,
      organizationId: this.organizationId,
      courseId: this.courseId,
      lessonId: this.lessonId,
      type: this.type,
      metadata: this.metadata,
      timestamp: this.timestamp.toISOString(),
    };
  }
}
