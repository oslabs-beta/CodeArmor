// src/rules/noUnsafeDeserialization.ts
import * as vscode from 'vscode';

export function noUnsafeDeserializationRule(
  code: string,
  document: vscode.TextDocument
): vscode.Diagnostic[] {
  const diagnostics: vscode.Diagnostic[] = [];

  const deserializationPatterns = [
    // Unsafe JSON.parse() with dynamic input
    {
      pattern:
        /JSON\.parse\s*\(\s*(?!(?:'[^']*'|"[^"]*"|`[^`]*`|\{[^}]*\}))([^)]+)\)/g,
      message:
        'Unsafe JSON.parse() with dynamic input - can lead to prototype pollution',
      severity: vscode.DiagnosticSeverity.Error,
      type: 'no-json-parse-unsafe',
    },
    // Unsafe Object.assign() - To catch multiple arguments
    {
      pattern:
        /Object\.assign\s*\(\s*\{[^}]*\},\s*[^,)]+,\s*[a-zA-Z_$][\w$]*(\.[\w$]+)+/g,
      message:
        'Unsafe Object.assign() with user-controlled input - can lead to prototype pollution',
      severity: vscode.DiagnosticSeverity.Error,
      type: 'object-merge-input',
    },
    // Unsafe object spread
    {
      pattern: /\.\.\.\s*[a-zA-Z_$][\w$]*\.[\w$]+/g,
      message:
        'Unsafe object spread with user-controlled input - can lead to prototype pollution',
      severity: vscode.DiagnosticSeverity.Warning,
      type: 'object-merge-input',
    },
    // Deep merge operations - To catch library patterns
    {
      pattern:
        /\.(merge|deepMerge|deepAssign|extend|defaultsDeep)\s*\(\s*[^,]+,\s*[a-zA-Z_$][\w$]*\.[\w$]+/g,
      message: 'Unsafe deep merge operation with user-controlled input',
      severity: vscode.DiagnosticSeverity.Error,
      type: 'object-merge-input',
    },
    // JSON.parse with concatenation
    {
      pattern: /JSON\.parse\s*\(\s*[^)]*\s*\+\s*[a-zA-Z_$][\w$]*/g,
      message:
        'JSON.parse() with string concatenation - unsafe with user input',
      severity: vscode.DiagnosticSeverity.Error,
      type: 'no-json-parse-unsafe',
    },
    // Unsafe Object constructor
    {
      pattern: /new\s+Object\s*\(\s*[a-zA-Z_$][\w$]*\.[\w$]+/g,
      message:
        'Unsafe Object constructor with user input - can lead to prototype pollution',
      severity: vscode.DiagnosticSeverity.Error,
      type: 'object-constructor-unsafe',
    },
  ];

  for (const { pattern, message, severity, type } of deserializationPatterns) {
    let match: RegExpExecArray | null;
    pattern.lastIndex = 0;

    while ((match = pattern.exec(code)) !== null) {
      try {
        // Skip matches in comments
        const lineStart = code.lastIndexOf('\n', match.index) + 1;
        const lineText = code.substring(lineStart, match.index);
        if (lineText.trim().startsWith('//')) {
          continue;
        }

        // Skip matches in strings
        const beforeMatch = code.substring(0, match.index);
        const stringRegex = /(['"`])(?:(?!\1).)*\1/g;
        let inString = false;
        let stringMatch;

        while ((stringMatch = stringRegex.exec(beforeMatch)) !== null) {
          if (stringMatch.index + stringMatch[0].length > match.index) {
            inString = true;
            break;
          }
        }

        if (inString) {
          continue;
        }

        const start = match.index;
        const end = start + match[0].length;
        const range = new vscode.Range(
          document.positionAt(start),
          document.positionAt(end)
        );

        const diagnostic = new vscode.Diagnostic(
          range,
          `[SECURITY] ${message}`,
          severity
        );
        diagnostic.source = 'NoUnsafeDeserialization';
        diagnostic.code = type;
        diagnostics.push(diagnostic);
      } catch (err) {
        console.error(`Error processing deserialization match: ${err}`);
      }

      if (match.index === pattern.lastIndex) {
        pattern.lastIndex++;
      }
    }
  }

  return diagnostics;
}
