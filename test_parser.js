import { MarkdownEvaluationParser } from './backend/src/infrastructure/services/MarkdownEvaluationParser.ts';
import fs from 'fs';

// Mock MarkdownRenderer
const mockRenderer = {
    render: async (text) => text
};

async function diagnostic() {
    const parser = new MarkdownEvaluationParser(mockRenderer);
    const path = 'e:/MyRepos/education/teach-laoz-learning-management-system/content/courses/teach-laoz-curso-dibujo-ninos/modulos/modulo_0/tema_0.1.1_evaluacion.md';
    const markdown = fs.readFileSync(path, 'utf-8');
    
    console.log('File length:', markdown.length);
    
    try {
        const evaluation = await parser.parse('test', markdown);
        console.log('Evaluation Title:', evaluation.title);
        console.log('Number of questions:', evaluation.questions.length);
        
        evaluation.questions.forEach((q, i) => {
            console.log(`\n--- Question ${i + 1} ---`);
            console.log(`Text: ${q.text.substring(0, 50)}...`);
            console.log(`Correct: "${q.correctAnswerId}"`);
            q.options.forEach(o => {
                console.log(`  [${o.id}] -> ${o.text.substring(0, 40)}...`);
            });
            if (q.feedback) console.log(`Feedback: ${q.feedback.substring(0, 30)}...`);
        });
    } catch (error) {
        console.error('Parsing failed:', error.message);
    }
}

diagnostic();
