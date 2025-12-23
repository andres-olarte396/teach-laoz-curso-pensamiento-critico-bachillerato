import { describe, it, expect, vi } from 'vitest';
import { ListContent } from '../../../src/application/use-cases/ListContent.js';
import { IContentRepository } from '../../../src/domain/repositories/IContentRepository.js';
import { ContentNode } from '../../../src/domain/entities/ContentNode.js';
import { ContentType } from '../../../src/domain/value-objects/ContentType.js';

describe('ListContent', () => {
  it('should list content for a given path', async () => {
    // Arrange
    const mockRepo: IContentRepository = {
      list: vi.fn().mockResolvedValue([
        ContentNode.create('course/lesson1.md', 'lesson1.md', ContentType.MARKDOWN),
        ContentNode.create('course/subdir', 'subdir', ContentType.DIRECTORY),
      ]),
      getFile: vi.fn(),
      exists: vi.fn(),
      isDirectory: vi.fn(),
      getMetadata: vi.fn(),
    };
    const useCase = new ListContent(mockRepo);

    // Act
    const result = await useCase.execute('course');

    // Assert
    expect(result.path).toBe('course');
    expect(result.items).toHaveLength(2);
    expect(result.items[0].name).toBe('lesson1.md');
    expect(result.items[0].type).toBe(ContentType.MARKDOWN);
    expect(result.items[1].name).toBe('subdir');
    expect(result.items[1].type).toBe(ContentType.DIRECTORY);
    expect(mockRepo.list).toHaveBeenCalledWith('course');
  });
});
