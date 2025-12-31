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

    const pushQuestion = () => {
      if (currentQuestion && currentQuestion.text && currentQuestion.options?.length) {
        questions.push(currentQuestion as Question);
        currentQuestion = null;
      }
    };

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line && currentSection !== 'cuestionario') continue; // Skip empty lines unless in questionnaire

        // Detectar Título Principal
        if (line.startsWith('# ') && title === 'Evaluación') {
            title = line.replace('# ', '').trim();
            continue;
        }

        // Detectar Secciones
        if (line.startsWith('## ')) {
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
        if (currentSection === 'cuestionario') {
            if (line.startsWith('### Pregunta')) {
                pushQuestion();
                
                const qTextParts = line.split(':').slice(1);
                const qTitle = qTextParts.join(':').trim();
                
                currentQuestion = {
                    id: `q${questions.length + 1}`,
                    text: qTitle,
                    options: []
                };
            } else if (currentQuestion) {
                if (/^[a-d]\)/.test(line)) {
                    const optId = line[0];
                    const optText = line.substring(2).trim();
                    currentQuestion.options?.push({ id: optId, text: optText });
                } else if (line !== '' && !line.startsWith('---')) {
                    // Accumulate question text if it's not an option or separator
                    if (currentQuestion.text) {
                        currentQuestion.text += '\n' + line;
                    } else {
                        currentQuestion.text = line;
                    }
                }
            }
        }

        // Procesar SOLUCIONARIO
        if (currentSection === 'solucionario' && line.startsWith('### Respuesta')) {
            const qNumMatch = line.match(/Respuesta (\d+)/);
            if (qNumMatch) {
                const qIndex = parseInt(qNumMatch[1]) - 1;
                const targetQuestion = questions[qIndex];
                
                if (targetQuestion) {
                    const ansMatch = line.match(/\*\*([a-d])\)/);
                    if (ansMatch) {
                        targetQuestion.correctAnswerId = ansMatch[1];
                    }

                    // Buscar justificación en las siguientes líneas
                    let j = i + 1;
                    while (j < lines.length && !lines[j].trim().startsWith('###')) {
                        const jLine = lines[j].trim();
                        if (jLine.startsWith('> **Justificación**:')) {
                            targetQuestion.feedback = jLine.replace('> **Justificación**:', '').trim();
                            break;
                        } else if (jLine.startsWith('>')) {
                             // Append to feedback if it's a blockquote but not the header
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
      throw new Error('No questions found in evaluation markdown');
    }

    // Renderizar Markdown a HTML para cada pregunta y opción
    for (const question of questions) {
        question.text = await this.markdownRenderer.render(question.text);
        if (question.feedback) {
            question.feedback = await this.markdownRenderer.render(question.feedback);
        }
        for (const option of question.options) {
            option.text = await this.markdownRenderer.render(option.text);
        }
    }

    return Evaluation.create(id, title, questions, metadata);
  }
}
