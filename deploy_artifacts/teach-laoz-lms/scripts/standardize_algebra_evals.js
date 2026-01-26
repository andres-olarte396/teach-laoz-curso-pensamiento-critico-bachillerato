const fs = require('fs');
const path = require('path');
const { globSync } = require('glob');


// Correct path to the Algebra course content
const ALGEBRA_COURSE_PATH = 'e:/MyRepos/education/teach-laoz/teach-laoz-curso-algebra-preuniversitaria';

function standardizeFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    let newLines = [];
    let changed = false;

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        
        // 1. Convert Question Header: "1. ¿Start..." -> "### Pregunta 1: ¿Start..."
        // Regex looks for: Start of line, optional whitespace, digit(s), dot, space.
        const questionMatch = line.match(/^(\s*)(\d+)\.\s+(.*)/);
        if (questionMatch) {
            // questionMatch[1] = indentation (usually empty)
            // questionMatch[2] = number
            // questionMatch[3] = text
            line = `${questionMatch[1]}### Pregunta ${questionMatch[2]}: ${questionMatch[3]}`;
            changed = true;
        }

        // 2. Process Options: "   - a) Text"
        // And mark correct answer if it doesn't say "incorrecta"
        const optionMatch = line.match(/^(\s*-\s*)([a-z])\)\s*(.*)/i);
        if (optionMatch) {
            const indent = optionMatch[1]; // includes "- "
            const letter = optionMatch[2];
            let text = optionMatch[3];

            // Reset: Remove existing (Correcta) marker to avoid duplicates or stale marks
            text = text.replace(/\s*\(Correcta\)/gi, '').trim();

            // Heuristic for Algebra course placeholder content: 
            // Mark as correct if it DOES NOT contain "incorrect" (matches incorrecta, incorrecto, etc.)
            // AND strictly for this specific course.
            if (!text.toLowerCase().includes('incorrect')) {
                text = `${text} (Correcta)`;
                changed = true;
            }
            
            line = `${indent}${letter}) ${text}`;
        }

        newLines.push(line);
    }

    if (changed) {
        fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
        console.log(`Updated: ${path.basename(filePath)}`);
    } else {
        console.log(`No changes needed: ${path.basename(filePath)}`);
    }
}

// glob pattern to find all evaluation files in the course
const pattern = `${ALGEBRA_COURSE_PATH}/**/*eval*.md`;

console.log(`Searching in: ${pattern}`);

try {
    const files = globSync(pattern);
    
    if (files.length === 0) {
        console.log("No evaluation files found.");
    } else {
        console.log(`Found ${files.length} files. Processing...`);
        files.forEach(file => {
            try {
                standardizeFile(file);
            } catch (e) {
                console.error(`Error processing ${file}:`, e);
            }
        });
        console.log("Done.");
    }
} catch (err) {
    console.error("Error finding files:", err);
}
