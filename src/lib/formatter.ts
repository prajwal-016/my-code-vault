// safe, robust, high-performance client-side code formatter for Monaco IDE
export function formatCode(code: string, language: string): string {
  if (!code || code.trim() === '') return '';

  const lines = code.split('\n');
  const cleanedLines = lines.map(line => line.trimEnd());
  
  // Collapse excess blank lines (maximum of 1 consecutive blank line)
  const collapsedLines: string[] = [];
  let prevWasBlank = false;
  for (const line of cleanedLines) {
    const isBlank = line.trim() === '';
    if (isBlank) {
      if (!prevWasBlank) {
        collapsedLines.push('');
      }
      prevWasBlank = true;
    } else {
      collapsedLines.push(line);
      prevWasBlank = false;
    }
  }

  const lang = language.toLowerCase();
  
  // Curly brace languages
  if (['cpp', 'c++', 'java', 'javascript', 'typescript', 'rust', 'go'].includes(lang)) {
    let indentLevel = 0;
    const tabSize = 4;
    const indentChar = ' ';
    const formattedLines: string[] = [];
    
    for (const line of collapsedLines) {
      const trimmed = line.trim();
      if (trimmed === '') {
        formattedLines.push('');
        continue;
      }
      
      // Decrease indent before checking if the line starts with a closing brace
      const startsWithClose = trimmed.startsWith('}') || trimmed.startsWith(']') || trimmed.startsWith(')');
      if (startsWithClose) {
        indentLevel = Math.max(0, indentLevel - 1);
      }
      
      const currentIndent = indentChar.repeat(indentLevel * tabSize);
      formattedLines.push(currentIndent + trimmed);
      
      // Calculate indent change for the NEXT line
      let netOpen = 0;
      let insideString = false;
      let stringChar = '';
      
      for (let i = 0; i < trimmed.length; i++) {
        const char = trimmed[i];
        
        // Skip comment lines
        if (!insideString && char === '/' && trimmed[i + 1] === '/') {
          break;
        }
        
        // Check string boundaries
        if ((char === '"' || char === "'") && trimmed[i - 1] !== '\\') {
          if (insideString) {
            if (char === stringChar) {
              insideString = false;
            }
          } else {
            insideString = true;
            stringChar = char;
          }
        }
        
        // Track braces if not in strings
        if (!insideString) {
          if (char === '{' || char === '[' || char === '(') {
            netOpen++;
          } else if (char === '}' || char === ']' || char === ')') {
            netOpen--;
          }
        }
      }
      
      // If we decreased indent earlier due to startsWithClose, and netOpen contains that close brace,
      // let's adjust netOpen so we don't double-count the close brace for the next line's indent.
      // E.g., if a line is just "}", startsWithClose was true (decreased indent by 1).
      // Inside loop, char is '}', which decreases netOpen by 1.
      // Since we already decreased indentLevel by 1, we add 1 back to balance it out!
      let nextLineIndentChange = netOpen;
      if (startsWithClose) {
        nextLineIndentChange += 1;
      }
      
      indentLevel = Math.max(0, indentLevel + nextLineIndentChange);
    }
    
    return formattedLines.join('\n');
  } 
  
  if (lang === 'python') {
    // Preserving Python indentation because it's semantic, but cleaning up operators and commas
    return collapsedLines.map(line => {
      const indentMatch = line.match(/^(\s*)/);
      const indent = indentMatch ? indentMatch[1] : '';
      const content = line.trim();
      if (content === '') return '';
      
      // Safe cosmetic spacing cleanup for assignment & operators
      // Avoid modifying strings or comments, so we do a simple safe character scan
      let formatted = '';
      let insideString = false;
      let stringChar = '';
      
      for (let i = 0; i < content.length; i++) {
        const char = content[i];
        
        // Python comment, skip formatting remainder
        if (!insideString && char === '#') {
          formatted += '  ' + content.slice(i);
          break;
        }
        
        if ((char === '"' || char === "'") && content[i - 1] !== '\\') {
          if (insideString) {
            if (char === stringChar) {
              insideString = false;
            }
          } else {
            insideString = true;
            stringChar = char;
          }
          formatted += char;
          continue;
        }
        
        if (insideString) {
          formatted += char;
        } else {
          // Standard spacing after commas
          if (char === ',') {
            formatted += ', ';
          }
          // Basic operator padding (ensure exactly one space around =, ==, +, -, *, /, etc.)
          else if (['+', '-', '*', '/'].includes(char)) {
            // Check if boundary is already padded
            const prevChar = formatted.slice(-1);
            if (prevChar !== ' ') formatted += ' ';
            formatted += char;
            if (content[i + 1] !== ' ') formatted += ' ';
          } 
          else {
            formatted += char;
          }
        }
      }
      
      // Collapse multiple spaces caused by padding injection
      const finalContent = formatted.replace(/\s+/g, ' ').replace(/,\s+/g, ', ').trim();
      return indent + finalContent;
    }).join('\n');
  }
  
  return collapsedLines.join('\n');
}
