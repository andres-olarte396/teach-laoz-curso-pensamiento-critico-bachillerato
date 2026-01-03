import { IEvidenceRepository, Evidence } from '../../../domain/repositories/IEvidenceRepository.js';

export class GetEvidence {
  constructor(private evidenceRepository: IEvidenceRepository) {}

  async execute(userId: string, courseId: string, lessonId: string): Promise<Evidence[]> {
    return await this.evidenceRepository.getByLesson(userId, courseId, lessonId);
  }
}
