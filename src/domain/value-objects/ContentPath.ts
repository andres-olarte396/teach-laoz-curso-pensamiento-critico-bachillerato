import { DomainError } from '@application/errors/DomainError.js';

/**
 * Value Object: Ruta de contenido normalizada y validada
 * Garantiza que las rutas sean seguras y consistentes
 */
export class ContentPath {
  private constructor(private readonly value: string) {}

  /**
   * Crea una ruta de contenido validada
   * @throws InvalidPathError si la ruta contiene caracteres peligrosos
   */
  static create(path: string): ContentPath {
    // Validar antes de normalizar para detectar rutas absolutas
    ContentPath.validateAbsolutePath(path);
    const normalized = ContentPath.normalize(path);
    ContentPath.validate(normalized);
    return new ContentPath(normalized);
  }

  /**
   * Valida que no sea una ruta absoluta
   */
  private static validateAbsolutePath(path: string): void {
    // Detectar rutas absolutas Unix
    if (path.startsWith('/')) {
      throw new DomainError('Absolute paths are not allowed: ' + path);
    }
    // Detectar rutas absolutas Windows (C:\, D:\, etc.)
    if (/^[a-zA-Z]:/.test(path)) {
      throw new DomainError('Absolute paths are not allowed: ' + path);
    }
  }

  /**
   * Normaliza la ruta eliminando barras iniciales y usando /
   */
  private static normalize(path: string): string {
    return path
      .replace(/\\/g, '/') // Windows -> Unix
      .replace(/^\/+/, '') // Eliminar barras iniciales
      .replace(/\/+/g, '/') // Consolidar barras múltiples
      .trim();
  }

  /**
   * Valida que la ruta no contenga path traversal u otros caracteres peligrosos
   */
  private static validate(path: string): void {
    // Detectar path traversal
    if (path.includes('..')) {
      throw new DomainError('Path traversal detected in path: ' + path);
    }

    // Detectar caracteres peligrosos (Windows)
    // eslint-disable-next-line no-control-regex
    const dangerousChars = /[<>:"|?*\x00-\x1f]/;
    if (dangerousChars.test(path)) {
      throw new DomainError('Invalid characters in path: ' + path);
    }
  }

  /**
   * Obtiene la ruta como string
   */
  toString(): string {
    return this.value;
  }

  /**
   * Obtiene el nombre del archivo o carpeta (última parte de la ruta)
   */
  getBasename(): string {
    const parts = this.value.split('/');
    return parts[parts.length - 1] || '';
  }

  /**
   * Obtiene el directorio padre
   */
  getParent(): ContentPath | null {
    const parts = this.value.split('/');
    if (parts.length <= 1) {
      return null;
    }
    return ContentPath.create(parts.slice(0, -1).join('/'));
  }

  /**
   * Combina esta ruta con una ruta relativa
   */
  join(relativePath: string): ContentPath {
    if (!this.value) {
      return ContentPath.create(relativePath);
    }
    return ContentPath.create(`${this.value}/${relativePath}`);
  }

  /**
   * Compara con otra ruta
   */
  equals(other: ContentPath): boolean {
    return this.value === other.value;
  }
}
