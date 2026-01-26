import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import prompts from 'prompts';

import dotenv from 'dotenv';

// Load environment variables from backend/.env
dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const BACKEND_DIR = path.join(__dirname, '../backend');

// Helper to resolve paths from env that might be relative to backend
function resolveEnvPath(envValue: string | undefined, defaultPath: string): string {
  if (!envValue) return defaultPath;
  if (path.isAbsolute(envValue)) return envValue;
  // Assume relative paths in .env are relative to the .env file location (backend)
  return path.resolve(BACKEND_DIR, envValue);
}

const COURSES_LIST_PATH = resolveEnvPath(
  process.env.COURSES_LIST_PATH,
  path.join(__dirname, 'COURSE_REPOSITORIES.md') // Fallback if not in env
);

const CONTENT_DIR = resolveEnvPath(
  process.env.CONTENT_BASE_PATH,
  path.join(__dirname, '../content/courses')
);

// Regex to find links in markdown: - [Name](URL)
const LINK_REGEX = /-\s*\[([^\]]+)\]\(([^)]+)\)/;

interface Course {
  name: string;
  url: string;
  folderName: string;
}

async function main() {
  console.log('📚 Content Downloader - Interactive Mode');

  if (!fs.existsSync(COURSES_LIST_PATH)) {
    console.error(`❌ Error: ${COURSES_LIST_PATH} not found.`);
    process.exit(1);
  }

  // 1. Parse Markdown
  const fileContent = fs.readFileSync(COURSES_LIST_PATH, 'utf-8');
  const lines = fileContent.split('\n');
  const availableCourses: Course[] = [];

  for (const line of lines) {
    const match = LINK_REGEX.exec(line);
    if (match) {
      const [_, name, url] = match;
      const folderName = path.basename(url, '.git') || name.replace(/\s+/g, '-').toLowerCase();
      availableCourses.push({ name, url, folderName });
    }
  }

  if (availableCourses.length === 0) {
    console.log('⚠️  No courses found in COURSE_REPOSITORIES.md');
    return;
  }

  // 2. Prompt User
  const response = await prompts({
    type: 'multiselect',
    name: 'selectedCourses',
    message: 'Select courses to download/update:',
    choices: availableCourses.map(c => ({
      title: c.name,
      value: c,
      selected: true // Default to all selected
    })),
    hint: '- Space to select. Return to submit',
    instructions: false,
  });

  const selectedCourses: Course[] = response.selectedCourses;

  if (!selectedCourses || selectedCourses.length === 0) {
    console.log('🚫 No courses selected.');
    return;
  }

  // 3. Process Selection
  if (!fs.existsSync(CONTENT_DIR)) {
    fs.mkdirSync(CONTENT_DIR, { recursive: true });
  }

  console.log(`\n🚀 Processing ${selectedCourses.length} courses...\n`);

  for (const course of selectedCourses) {
    console.log(`📦 Course: ${course.name}`);
    const targetPath = path.join(CONTENT_DIR, course.folderName);

    if (fs.existsSync(targetPath)) {
      console.log(`   🔄 Updating (git pull)...`);
      try {
        execSync('git pull', { stdio: 'inherit', cwd: targetPath });
        console.log(`   ✅ Updated.`);
      } catch (e) {
        console.error(`   ❌ Failed to update.`);
      }
    } else {
      console.log(`   ⬇️  Cloning...`);
      try {
        execSync(`git clone ${course.url} "${targetPath}"`, { stdio: 'inherit' });
        console.log(`   ✅ Cloned.`);
      } catch (e) {
        console.error(`   ❌ Failed to clone.`);
      }
    }
    console.log(''); // newline
  }

  console.log('✨ All operations completed!');
}

main().catch(console.error);
