import re
import os

def parse_mock(markdown):
    lines = markdown.split('\n')
    questions = []
    current_section = 'none'
    current_question = None
    
    if '## FICHA TÉCNICA' not in markdown and '## CUESTIONARIO' not in markdown:
        current_section = 'cuestionario'

    for i, line in enumerate(lines):
        line = line.strip()
        if not line: continue
        
        if line.startswith('## ') and 'PREGUNTA' not in line.upper():
            if current_question:
                questions.append(current_question)
                current_question = None
            section_name = line.replace('## ', '').upper()
            if 'FICHA' in section_name: current_section = 'ficha'
            elif 'CUESTIONARIO' in section_name: current_section = 'cuestionario'
            elif 'SOLUCIONARIO' in section_name: current_section = 'solucionario'
            continue
            
        if current_section in ['cuestionario', 'none']:
            q_match = re.match(r'^(?:###?|##)\s*(?:Pregunta|Question)\s*(\d+)?:?\s*(.*)', line, re.I)
            if q_match:
                if current_question: questions.append(current_question)
                current_question = {'id': len(questions)+1, 'text': q_match.group(2) or '', 'options': {}}
            elif current_question:
                opt_match = re.match(r'^(?:[-*]\s+)?([a-d1-4])(?:\.|\))\s+(.*)', line, re.I)
                if opt_match:
                    opt_id = opt_match.group(1).lower()
                    current_question['options'][opt_id] = opt_match.group(2)
                else:
                    current_question['text'] += '\n' + line
                    
        if current_section == 'solucionario' and line.startswith('### Respuesta'):
            q_num_match = re.search(r'Respuesta (\d+)', line)
            if q_num_match:
                idx = int(q_num_match.group(1)) - 1
                if idx < len(questions):
                    ans_match = re.search(r'\*\*([a-d1-4])(?:\.|\))', line, re.I)
                    if ans_match:
                        questions[idx]['correct'] = ans_match.group(1).lower()
    
    if current_question: questions.append(current_question)
    return questions

path = r'e:\MyRepos\education\teach-laoz-learning-management-system\content\courses\teach-laoz-curso-dibujo-ninos\modulos\modulo_0\tema_0.1.1_evaluacion.md'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

questions = parse_mock(content)
for i, q in enumerate(questions):
    print(f"\n--- Q{i+1}: {q.get('text', '')[:40]} ---")
    print(f"Correct: {q.get('correct', 'MISSING')}")
    for k, v in q['options'].items():
        print(f"  [{k}] {v[:50]}")
