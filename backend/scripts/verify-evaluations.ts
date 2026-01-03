
import fs from 'fs';
import path from 'path';
import { MarkdownEvaluationParser } from '../src/infrastructure/services/MarkdownEvaluationParser';
import { UnifiedMarkdownRenderer } from '../src/infrastructure/services/UnifiedMarkdownRenderer';
import { Evaluation } from '../src/domain/entities/Evaluation';

async function main() {
  // Assuming script is run from 'backend' directory
  const contentDir = path.resolve(process.cwd(), '../content/courses/teach-laoz-curso-dibujo-ninos');
  console.log(`Scanning directory: ${contentDir}`);

  if (!fs.existsSync(contentDir)) {
    console.error('Directory not found! Ensure you are running from the "backend" directory.');
    process.exit(1);
  }

  const renderer = new UnifiedMarkdownRenderer();
  const parser = new MarkdownEvaluationParser(renderer);

  const files = getAllFiles(contentDir, []);
  const evaluationFiles = files.filter(f => f.toLowerCase().endsWith('evaluacion.md'));

  console.log(`Found ${evaluationFiles.length} evaluation files.`);

  let parsedCount = 0;
  let errorCount = 0;
  const errors: string[] = [];

  for (const file of evaluationFiles) {
    const relativePath = path.relative(contentDir, file);
    // console.log(`Checking: ${relativePath}`); 
    try {
      const content = fs.readFileSync(file, 'utf-8');
      const evaluation: Evaluation = await parser.parse(relativePath, content);

      // Validation Logic
      if (evaluation.type === 'quiz') {
          if (evaluation.questions.length === 0) {
              throw new Error('No questions found');
          }
          evaluation.questions.forEach((q, idx) => {
             if (q.options.length > 0) {
                 if (!q.correctAnswerId) {
                     throw new Error(`Question ${idx + 1} ("${q.text.substring(0, 20)}...") missing correct answer.`);
                 }
                 const validOption = q.options.find(o => o.id.toLowerCase() === q.correctAnswerId.toLowerCase());
                 if (!validOption) {
                      throw new Error(`Question ${idx + 1} has invalid correct answer ID "${q.correctAnswerId}". Options are: ${q.options.map(o => o.id).join(', ')}`);
                 }
             }
          });
      }

      parsedCount++;
    } catch (err: any) {
      errorCount++;
      console.error(`\n[FAIL] ${relativePath}: ${err.message}`);
      // Log first few lines of content for context
      // const content = fs.readFileSync(file, 'utf-8');
      // console.log(content.split('\n').slice(0, 5).join('\n'));
    }
  }

  console.log('\n\nVerification Complete.');
  console.log(`Passed: ${parsedCount}`);
  console.log(`Failed: ${errorCount}`);

  if (errorCount > 0) {
    process.exit(1);
  } else {
    console.log('\nAll evaluations look valid!');
    process.exit(0);
  }
}

function getAllFiles(dirPath: string, arrayOfFiles: string[]) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(dirPath, "/", file));
    }
  });

  return arrayOfFiles;
}

main().catch(console.error);
