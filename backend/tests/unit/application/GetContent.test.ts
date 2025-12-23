import { describe, it, expect, vi } from 'vitest';
import { GetContent } from '../../../src/application/use-cases/GetContent.js';
import { IContentRepository } from '../../../src/domain/repositories/IContentRepository.js';
import { ContentNotFoundError } from '../../../src/application/errors/DomainError.js';

describe('GetContent', () => {
  it('should return content for a valid file path', async () => {
    // Arrange
    const mockRepo: IContentRepository = {
      list: vi.fn(),
      getFile: vi.fn().mockResolvedValue('markdown content'),
      exists: vi.fn().mockResolvedValue(true),
      isDirectory: vi.fn().mockResolvedValue(false),
      getMetadata: vi.fn().mockResolvedValue({
        size: 100,
        lastModified: new Date('2025-12-23'),
        mimeType: 'text/markdown',
      }),
    };
    const useCase = new GetContent(mockRepo);

    // Act
    const result = await useCase.execute('course/lesson1.md');

    // Assert
    expect(result.name).toBe('lesson1.md');
    expect(result.content).toBe('markdown content');
    expect(result.metadata?.size).toBe(100);
    expect(mockRepo.getFile).toHaveBeenCalledWith('course/lesson1.md');
  });

  it('should throw ContentNotFoundError if path does not exist', async () => {
    // Arrange
    const mockRepo: IContentRepository = {
      list: vi.fn(),
      getFile: vi.fn(),
      exists: vi.fn().mockResolvedValue(false),
      isDirectory: vi.fn(),
      getMetadata: vi.fn(),
    };
    const useCase = new GetContent(mockRepo);

    // Act & Assert
    await expect(useCase.execute('invalid/path')).rejects.toThrow(ContentNotFoundError);
  });
});
