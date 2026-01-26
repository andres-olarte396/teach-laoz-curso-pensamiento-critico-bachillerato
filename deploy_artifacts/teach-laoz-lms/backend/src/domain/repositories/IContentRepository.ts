import { ContentNode, ContentMetadata } from '../entities/ContentNode.js';

/**
 * Contrato del repositorio de contenido
 * Define cómo acceder al contenido independientemente del proveedor
 */
export interface IContentRepository {
  /**
   * Lista el contenido de un directorio
   * @param path Ruta relativa del directorio (vacío para raíz)
   * @returns Array de nodos de contenido
   */
  list(path: string): Promise<ContentNode[]>;

  /**
   * Obtiene el contenido de un archivo
   * @param path Ruta relativa del archivo
   * @returns Contenido como Buffer (binarios) o string (texto)
   */
  getFile(path: string): Promise<Buffer | string>;

  /**
   * Verifica si una ruta existe
   * @param path Ruta relativa
   */
  exists(path: string): Promise<boolean>;

  /**
   * Verifica si una ruta es un directorio
   * @param path Ruta relativa
   */
  isDirectory(path: string): Promise<boolean>;

  /**
   * Obtiene metadata de un archivo o carpeta
   * @param path Ruta relativa
   */
  getMetadata(path: string): Promise<ContentMetadata>;

  /**
   * Lista recursivamente todos los archivos de un directorio
   * @param path Ruta relativa
   */
  listRecursive(path: string): Promise<ContentNode[]>;
}
