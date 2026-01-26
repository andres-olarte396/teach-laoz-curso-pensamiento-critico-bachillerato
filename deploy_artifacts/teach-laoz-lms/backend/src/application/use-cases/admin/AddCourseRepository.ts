import fs from 'fs';
import path from 'path';

interface AddRepositoryDto {
  name: string;
  url: string;
}

export class AddCourseRepository {
  private readonly coursesListPath: string;

  constructor() {
    this.coursesListPath = path.resolve(process.cwd(), '../COURSE_REPOSITORIES.md');
  }

  async execute({ name, url }: AddRepositoryDto): Promise<void> {
    if (!fs.existsSync(this.coursesListPath)) {
      throw new Error(`Course list not found at ${this.coursesListPath}`);
    }

    const fileContent = fs.readFileSync(this.coursesListPath, 'utf-8');
    
    // Check if URL already exists to prevent duplicates
    if (fileContent.includes(url)) {
      throw new Error('Repository URL already exists in the list');
    }

    // Append new repository
    const newLine = `\n- [${name}](${url})`;
    fs.appendFileSync(this.coursesListPath, newLine);
  }
}
