const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'content/blog/welcome.md');
const fileContent = fs.readFileSync(filePath, 'utf-8');

console.log('File length:', fileContent.length);
console.log('First 20 chars:', JSON.stringify(fileContent.substring(0, 20)));

const match = fileContent.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
if (match) {
    console.log('MATCHED!');
    console.log('Frontmatter:', match[1]);
} else {
    console.log('NO MATCH');
    
    // Try with \r\n
    const matchCRLF = fileContent.match(/^---\r\n([\s\S]*?)\r\n---\r\n([\s\S]*)$/);
    if (matchCRLF) {
        console.log('MATCHED with CRLF strict!');
    } else {
        // Try with flexible whitespace
        const matchFlexible = fileContent.match(/^---\s+([\s\S]*?)\s+---\s+([\s\S]*)$/);
        if (matchFlexible) {
             console.log('MATCHED with Flexible whitespace!');
        } else {
            console.log('Still NO MATCH');
        }
    }
}
