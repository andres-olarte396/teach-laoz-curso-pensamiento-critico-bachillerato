import { describe, it, expect, vi } from 'vitest';
import { GenerateMenu } from '../../../src/application/use-cases/GenerateMenu.js';
import { IContentRepository } from '../../../src/domain/repositories/IContentRepository.js';
import { ContentNode } from '../../../src/domain/entities/ContentNode.js';
import { ContentType } from '../../../src/domain/value-objects/ContentType.js';

describe('GenerateMenu', () => {
  it('should generate a menu structure', async () => {
    // Arrange
    const mockRepo: IContentRepository = {
      list: vi.fn()
        .mockResolvedValueOnce([
          ContentNode.create('course1', 'course1', ContentType.DIRECTORY),
        ])
        .mockResolvedValueOnce([
          ContentNode.create('course1/lesson1.md', 'lesson1.md', ContentType.MARKDOWN),
        ]),
      getFile: vi.fn(),
      exists: vi.fn(),
      isDirectory: vi.fn()
        .mockResolvedValueOnce(true) // course1
        .mockResolvedValueOnce(false), // lesson1.md
      getMetadata: vi.fn(),
    };
    const useCase = new GenerateMenu(mockRepo);

    // Act
    const result = await useCase.execute();

    // Assert
    expect(result.courses).toHaveLength(1);
    expect(result.courses[0].id).toBe('course1');
    expect(result.courses[0].children?.[0].id).toBe('lesson1.md');
    expect(mockRepo.list).toHaveBeenCalledWith('');
  });
});
