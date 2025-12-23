import { describe, it, expect, beforeAll } from 'vitest';
import { LocalFileSystemRepository } from '../../src/infrastructure/repositories/LocalFileSystemRepository.js';
import path from 'path';
import fs from 'fs/promises';

describe('LocalFileSystemRepository Integration', () => {
  const repo = new LocalFileSystemRepository();
  const testCoursePath = 'example-course';

  it('should list courses in root', async () => {
    const courses = await repo.list('');
    expect(courses.length).toBeGreaterThan(0);
    expect(courses.some(c => c.name === testCoursePath)).toBe(true);
  });

  it('should list content of a course', async () => {
    const content = await repo.list(testCoursePath);
    expect(content.length).toBeGreaterThan(0);
  });

  it('should read a markdown file', async () => {
    const content = await repo.getFile(path.join(testCoursePath, 'README.md'));
    expect(typeof content).toBe('string');
    expect(content).toContain('#');
  });

  it('should throw error for path traversal', async () => {
    await expect(repo.list('../../../')).rejects.toThrow('Access denied');
  });
});
