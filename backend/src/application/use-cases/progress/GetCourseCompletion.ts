import { IContentRepository } from '../../../domain/repositories/IContentRepository.js';
import { IProgressRepository } from '../../../domain/repositories/IProgressRepository.js';

export class GetCourseCompletion {
  constructor(
    private contentRepository: IContentRepository,
    private progressRepository: IProgressRepository
  ) {}

  async execute(userId: string, courseId: string) {
    // 1. Get all content nodes (lessons, evaluations, etc)
    const allNodes = await this.contentRepository.listRecursive(courseId);
    
    // 2. Filter for navigable content (markdown, html, evaluations)
    // We ignore directories as they are containers
    const lessons = allNodes.filter(node => 
      node.isMarkdown() || 
      node.isHtml() || 
      node.name.toLowerCase().includes('evaluacion')
    );

    const total = lessons.length;
    if (total === 0) return { total: 0, completed: 0, percentage: 0 };

    // 3. Get user progress for this course
    const progress = await this.progressRepository.findByUserAndCourse(userId, courseId);
    
    // 4. Count unique completed entries that match our lessons list
    const completedIds = new Set(progress.filter(p => p.completed).map(p => p.lessonId));
    
    // Some lessons might not be in progress yet, so we intersect
    const completedCount = lessons.filter(lesson => completedIds.has(lesson.path.toString())).length;

    const percentage = Math.round((completedCount / total) * 100);

    return {
      total,
      completed: completedCount,
      percentage
    };
  }
}
