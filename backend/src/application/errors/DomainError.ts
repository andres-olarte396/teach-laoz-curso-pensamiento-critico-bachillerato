/**
 * Error base del dominio
 */
export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error cuando el contenido no existe
 */
export class ContentNotFoundError extends DomainError {
  constructor(path: string) {
    super(`Content not found: ${path}`);
  }
}

/**
 * Error cuando la ruta es inválida
 */
export class InvalidPathError extends DomainError {
  constructor(message: string) {
    super(`Invalid path: ${message}`);
  }
}

/**
 * Error en el renderizado de contenido
 */
export class RenderError extends DomainError {
  constructor(
    message: string,
    public readonly cause?: Error
  ) {
    super(`Render error: ${message}`);
  }
}
