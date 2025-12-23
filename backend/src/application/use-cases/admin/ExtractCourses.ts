import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { exec } from 'child_process';
import { env } from '../../../infrastructure/config/environment.js';

const execAsync = promisify(exec);

interface CourseRepo {
  name: string;
  url: string;
  folderName: string;
}

interface ExtractionResult {
  cloned: string[];
  updated: string[];
  failed: Array<{ name: string; error: string }>;
}

export class ExtractCourses {
  private readonly coursesListPath: string;
  private readonly contentDir: string;

  constructor() {
    // Assuming backend root is where the process runs
    this.coursesListPath = path.resolve(process.cwd(), '../COURSE_REPOSITORIES.md');
    this.contentDir = path.resolve(env.CONTENT_BASE_PATH);
  }

  async execute(): Promise<ExtractionResult> {
    const result: ExtractionResult = {
      cloned: [],
      updated: [],
      failed: [],
    };

    try {
      if (!fs.existsSync(this.coursesListPath)) {
        throw new Error(`Course list not found at ${this.coursesListPath}`);
      }

      const fileContent = fs.readFileSync(this.coursesListPath, 'utf-8');
      const courses = this.parseCourses(fileContent);

      if (!fs.existsSync(this.contentDir)) {
        fs.mkdirSync(this.contentDir, { recursive: true });
      }

      for (const course of courses) {
        const targetPath = path.join(this.contentDir, course.folderName);

        try {
          if (fs.existsSync(targetPath)) {
            // Check if .git exists to allow pull
            const gitPath = path.join(targetPath, '.git');
            if (fs.existsSync(gitPath)) {
               // Update
               await execAsync('git pull', { cwd: targetPath });
               // Removve .git to cleanup
               fs.rmSync(gitPath, { recursive: true, force: true });
               result.updated.push(course.name);
            } else {
               // Re-clone (delete and clone)
               fs.rmSync(targetPath, { recursive: true, force: true });
               await execAsync(`git clone ${course.url} "${targetPath}"`);
               fs.rmSync(path.join(targetPath, '.git'), { recursive: true, force: true });
               result.updated.push(course.name + ' (Re-cloned)');
            }
          } else {
            // Clone
            await execAsync(`git clone ${course.url} "${targetPath}"`);
            fs.rmSync(path.join(targetPath, '.git'), { recursive: true, force: true });
            result.cloned.push(course.name);
          }
        } catch (error: any) {
          result.failed.push({
            name: course.name,
            error: error.message || 'Unknown error',
          });
        }
      }

      return result;
    } catch (error: any) {
      throw new Error(`Failed to extract courses: ${error.message}`);
    }
  }

  private parseCourses(content: string): CourseRepo[] {
    const lines = content.split('\n');
    const courses: CourseRepo[] = [];
    const linkRegex = /-\s*\[([^\]]+)\]\(([^)]+)\)/;

    for (const line of lines) {
      const match = linkRegex.exec(line);
      if (match) {
        const [_, name, url] = match;
        // Ignore template
        if (url === 'URL_DEL_GIT_REPO') continue;

        const folderName = path.basename(url, '.git') || name.replace(/\s+/g, '-').toLowerCase();
        courses.push({ name, url, folderName });
      }
    }

    return courses;
  }
}
