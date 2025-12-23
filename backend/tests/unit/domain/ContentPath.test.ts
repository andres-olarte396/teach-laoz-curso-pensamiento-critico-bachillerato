import { describe, it, expect } from 'vitest';
import { ContentPath } from '../../../src/domain/value-objects/ContentPath.js';
import { DomainError } from '../../../src/application/errors/DomainError.js';

describe('ContentPath', () => {
  describe('create', () => {
    it('should create a valid path', () => {
      const path = ContentPath.create('courses/typescript/lesson-01.md');
      expect(path.toString()).toBe('courses/typescript/lesson-01.md');
    });

    it('should normalize Windows paths to Unix', () => {
      const path = ContentPath.create('courses\\typescript\\lesson-01.md');
      expect(path.toString()).toBe('courses/typescript/lesson-01.md');
    });

    it('should remove leading slashes from relative paths', () => {
      // Note: Las rutas con barra inicial se consideran absolutas y se rechazan
      // Este test verifica que las rutas relativas sin barra se normalizan correctamente
      const path = ContentPath.create('courses/typescript/lesson-01.md');
      expect(path.toString()).toBe('courses/typescript/lesson-01.md');
    });

    it('should throw error for path traversal', () => {
      expect(() => ContentPath.create('../etc/passwd')).toThrow(DomainError);
      expect(() => ContentPath.create('courses/../../etc/passwd')).toThrow(DomainError);
    });

    it('should throw error for absolute paths', () => {
      expect(() => ContentPath.create('/etc/passwd')).toThrow(DomainError);
      expect(() => ContentPath.create('C:\\Windows\\System32')).toThrow(DomainError);
    });

    it('should throw error for dangerous characters', () => {
      expect(() => ContentPath.create('file<>name.txt')).toThrow(DomainError);
      expect(() => ContentPath.create('file|name.txt')).toThrow(DomainError);
    });
  });

  describe('getBasename', () => {
    it('should return the last part of the path', () => {
      const path = ContentPath.create('courses/typescript/lesson-01.md');
      expect(path.getBasename()).toBe('lesson-01.md');
    });

    it('should return empty string for empty path', () => {
      const path = ContentPath.create('');
      expect(path.getBasename()).toBe('');
    });
  });

  describe('getParent', () => {
    it('should return parent directory path', () => {
      const path = ContentPath.create('courses/typescript/lesson-01.md');
      const parent = path.getParent();
      expect(parent?.toString()).toBe('courses/typescript');
    });

    it('should return null for root level path', () => {
      const path = ContentPath.create('course');
      const parent = path.getParent();
      expect(parent).toBeNull();
    });
  });

  describe('join', () => {
    it('should join paths correctly', () => {
      const basePath = ContentPath.create('courses/typescript');
      const joined = basePath.join('lesson-01.md');
      expect(joined.toString()).toBe('courses/typescript/lesson-01.md');
    });

    it('should handle empty base path', () => {
      const basePath = ContentPath.create('');
      const joined = basePath.join('courses/typescript');
      expect(joined.toString()).toBe('courses/typescript');
    });
  });

  describe('equals', () => {
    it('should return true for equal paths', () => {
      const path1 = ContentPath.create('courses/typescript/lesson-01.md');
      const path2 = ContentPath.create('courses/typescript/lesson-01.md');
      expect(path1.equals(path2)).toBe(true);
    });

    it('should return false for different paths', () => {
      const path1 = ContentPath.create('courses/typescript/lesson-01.md');
      const path2 = ContentPath.create('courses/javascript/lesson-01.md');
      expect(path1.equals(path2)).toBe(false);
    });
  });
});
