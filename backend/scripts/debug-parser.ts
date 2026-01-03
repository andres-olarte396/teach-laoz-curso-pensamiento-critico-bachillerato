
import fs from 'fs';
import path from 'path';
import { MarkdownEvaluationParser } from '../src/infrastructure/services/MarkdownEvaluationParser';
import { UnifiedMarkdownRenderer } from '../src/infrastructure/services/UnifiedMarkdownRenderer';

async function main() {
  const filePath = path.resolve(process.cwd(), '../content/courses/teach-laoz-curso-dibujo-ninos/modulos/modulo_0/tema_0.2.1_evaluacion.md');
  console.log(`Debug parsing: ${filePath}`);

  const content = fs.readFileSync(filePath, 'utf-8');
  console.log('--- Content Start ---');
  console.log(content.substring(0, 200));
  console.log('--- Content End ---');

  const renderer = new UnifiedMarkdownRenderer();
  const parser = new MarkdownEvaluationParser(renderer);

  try {
    const result = await parser.parse('debug', content);
    console.log('Success!');
    console.log(JSON.stringify(result, null, 2));
  } catch (e: any) {
    console.error('Error:', e.message);
  }
}

main();
