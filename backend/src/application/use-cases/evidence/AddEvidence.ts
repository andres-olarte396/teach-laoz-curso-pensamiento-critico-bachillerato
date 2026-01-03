import { IEvidenceRepository, Evidence } from '../../../domain/repositories/IEvidenceRepository.js';
import { v4 as uuidv4 } from 'uuid';

export class AddEvidence {
  constructor(private evidenceRepository: IEvidenceRepository) {}

  async execute(userId: string, courseId: string, lessonId: string, content: string, type: 'text' | 'image' = 'text', mediaUrl?: string): Promise<Evidence> {
    const evidence: Evidence = {
      id: uuidv4(),
      userId,
      courseId,
      lessonId,
      content,
      type,
      mediaUrl,
      createdAt: new Date()
    };

    await this.evidenceRepository.add(evidence);
    return evidence;
  }
}
