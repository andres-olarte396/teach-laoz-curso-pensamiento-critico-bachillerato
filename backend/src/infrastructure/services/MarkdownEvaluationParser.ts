import { Evaluation, Question } from '../../domain/entities/Evaluation.js';
import { IMarkdownRenderer } from '../../domain/services/IMarkdownRenderer.js';

/**
 * Servicio de infraestructura para transformar Markdown de evaluaciones en entidades de Dominio.
 * El formato esperado es:
 * # Título
 * ## FICHA TÉCNICA (opcional)
 * ## CUESTIONARIO
 * ### Pregunta X: ...
 * a) ...
 * b) ...
 * ## SOLUCIONARIO
 * ### Respuesta X: **a) ...**
 * > **Justificación**: ...
 */
export class MarkdownEvaluationParser {
  constructor(private readonly markdownRenderer: IMarkdownRenderer) {}

  public async parse(id: string, markdown: string): Promise<Evaluation> {
    const lines = markdown.split('\n');
    let title = 'Evaluación';
    const questions: Question[] = [];
    const metadata: Record<string, any> = {};

    let currentSection: 'none' | 'ficha' | 'cuestionario' | 'solucionario' = 'none';
    let currentQuestion: Partial<Question> | null = null;

    if (!markdown.includes('## FICHA TÉCNICA') && !markdown.includes('## CUESTIONARIO')) {
      currentSection = 'cuestionario';
    }

    const pushQuestion = () => {
      if (currentQuestion && currentQuestion.text) {
        questions.push(currentQuestion as Question);
        currentQuestion = null;
      }
    };

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line && currentSection !== 'cuestionario') continue;

        // Detectar Título Principal
        if (line.startsWith('# ') && title === 'Evaluación') {
            title = line.replace('# ', '').trim();
            continue;
        }

        // Detectar Secciones
        if (line.startsWith('## ') && !line.toUpperCase().includes('PREGUNTA')) {
            pushQuestion();
            const sectionName = line.replace('## ', '').toUpperCase();
            if (sectionName.includes('FICHA')) currentSection = 'ficha';
            else if (sectionName.includes('CUESTIONARIO')) currentSection = 'cuestionario';
            else if (sectionName.includes('SOLUCIONARIO')) currentSection = 'solucionario';
            else currentSection = 'none';
            continue;
        }

        // Procesar FICHA TÉCNICA
        if (currentSection === 'ficha' && line.startsWith('- **')) {
            const match = line.match(/- \*\*(.*?)\*\*:\s*(.*)/);
            if (match) {
                metadata[match[1].toLowerCase()] = match[2];
            }
        }

        // Procesar CUESTIONARIO
        if (currentSection === 'cuestionario' || currentSection === 'none') {
            const questionMatch = line.match(/^(?:###?|##)\s*(?:Pregunta|Question)\s*(\d+)?:?\s*(.*)/i);
            
            if (questionMatch) {
                pushQuestion();
                currentQuestion = {
                    id: `q${questions.length + 1}`,
                    text: questionMatch[2] || '',
                    options: []
                };
            } else if (currentQuestion) {
                // Detectar Opciones: "a) ...", "- A) ...", "1. ..."
                const optionMatch = line.match(/^(?:[-*]\s+)?([a-d1-4])(?:\.|\))\s+(.*)/i);
                
                if (optionMatch) {
                    const optId = optionMatch[1].toLowerCase().trim();
                    let optText = optionMatch[2].trim();
                    
                    let isCorrect = false;
                    if (optText.includes('(Correcta)') || optText.includes('(Correcto)') || (optText.startsWith('**') && optText.endsWith('**'))) {
                        isCorrect = true;
                        optText = optText.replace(/\(Correcta?\)/i, '').replace(/\*\*/g, '').trim();
                    }

                    currentQuestion.options?.push({ id: optId, text: optText });
                    if (isCorrect) {
                        currentQuestion.correctAnswerId = optId;
                    }
                } else if (line !== '' && !line.startsWith('---')) {
                    if (currentQuestion.text) {
                        currentQuestion.text += '\n' + line;
                    } else {
                        currentQuestion.text = line;
                    }
                }
            }
        }

        // Procesar SOLUCIONARIO explicito - Mas flexible
        if (currentSection === 'solucionario' && line.startsWith('### Respuesta')) {
            const qNumMatch = line.match(/Respuesta (\d+)/);
            if (qNumMatch) {
                const qIndex = parseInt(qNumMatch[1]) - 1;
                const targetQuestion = questions[qIndex];
                
                if (targetQuestion) {
                    // Buscar la letra de la respuesta mas agresivamente
                    // Soporta: **B) Mito**, B) Mito, **B**, B.
                    const ansMatch = line.match(/(?:\*\*)?([a-d1-4])(?:\.|\))\s*(?:\*\*)?/i);
                    if (ansMatch) {
                        targetQuestion.correctAnswerId = ansMatch[1].toLowerCase().trim();
                    }

                    // Buscar justificación
                    let j = i + 1;
                    while (j < lines.length && !lines[j].trim().startsWith('###')) {
                        const jLine = lines[j].trim();
                        if (jLine.startsWith('> **Justificación**:')) {
                            targetQuestion.feedback = jLine.replace('> **Justificación**:', '').trim();
                            break;
                        } else if (jLine.startsWith('>')) {
                             const blockContent = jLine.replace(/^>\s*/, '').trim();
                             if (blockContent) {
                                 targetQuestion.feedback = (targetQuestion.feedback ? targetQuestion.feedback + '\n' : '') + blockContent;
                             }
                        }
                        j++;
                    }
                }
            }
        }
    }

    // Final push
    pushQuestion();

    if (questions.length === 0) {
      throw new Error('No questions found in evaluation markdown. Ensure questions start with "### Pregunta X"');
    }

    // Renderizar y Log Final
    console.log(`[Parser] Evaluation parsed: "${title}" (${questions.length} questions)`);
    for (const question of questions) {
        console.log(`[Parser] Q:${question.id} CorrectID:[${question.correctAnswerId}] Options:[${question.options.map(o => o.id).join(',')}]`);
        question.text = await this.markdownRenderer.render(question.text);
        if (question.feedback) {
            question.feedback = await this.markdownRenderer.render(question.feedback);
        }
        for (const option of question.options) {
            option.text = await this.markdownRenderer.render(option.text);
        }
    }

    // Determine type based on metadata
    const type = metadata['type'] === 'ai_open' ? 'ai_open' : 'quiz';
    console.log(`[Parser Debug] Parsed type for ${id}: ${type} (Metadata Type: ${metadata['type']})`);

    return Evaluation.create(id, title, questions, metadata, type);
  }
}
