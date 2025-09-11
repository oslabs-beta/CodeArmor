// src/rules/noCodeInjection.ts
import * as vscode from 'vscode';

export function noCodeInjectionRule(
  code: string,
  document: vscode.TextDocument
): vscode.Diagnostic[] {
  const diagnostics: vscode.Diagnostic[] = [];

  const injectionPatterns = [
    //Unsafe eval usage
    {
      pattern: /eval\s*\(\s*[^'"`][^)]*/g,
      message:
        'Direct eval usage with dynamic input can execute arbitrary code',
      severity: vscode.DiagnosticSeverity.Error,
    },
    //Unsanitized HTML assignment
    {
      pattern: /\.(innerHTML|outerHTML)\s*=\s*[a-zA-Z_$][\w$]*/g,
      message: 'Unsanitized HTML assignment can lead to XSS',
      severity: vscode.DiagnosticSeverity.Warning,
    },
    //String arguments in Timer
    {
      pattern: /(setTimeout|setInterval)\s*\(\s*["'`]/g,
      message: 'String argument in timer can execute arbitrary code',
      severity: vscode.DiagnosticSeverity.Error,
    },
    //Function contructor with dynamic input
    {
      pattern: /new\s+Function\s*\([^)]*[^'"`]/g,
      message:
        'Function constructor with dynamic input can execute arbitrary code',
      severity: vscode.DiagnosticSeverity.Error,
    },
    //Unsanitized document.write
    {
      pattern: /document\.write\(\s*[^'"`][^)]*/g,
      message: 'Unsanitized document.write can lead to XSS',
      severity: vscode.DiagnosticSeverity.Warning,
    },
    //Unsanitized iframe
    {
      pattern: /\.srcdoc\s*=\s*[^'"`][^;]*/g,
      message: 'Unsanitized iframe srcdoc can lead to XSS',
      severity: vscode.DiagnosticSeverity.Warning,
    },
    //Dymnamic script injection
    {
      pattern: /<script[^>]*>[\s\S]*?<\/script>/gi,
      message: 'Dynamic script injection can execute arbitrary code',
      severity: vscode.DiagnosticSeverity.Error,
    },
    //Unsanitized DOM
    {
      pattern: /\.replaceWith\(\s*[^'"`][^)]*/g,
      message: 'Unsanitized DOM replacement can lead to XSS',
      severity: vscode.DiagnosticSeverity.Warning,
    },
    //Unsanitized HTML
    {
      pattern: /\.insertAdjacentHTML\(\s*[^'"`][^)]*/g,
      message: 'Unsanitized HTML insertion can lead to XSS',
      severity: vscode.DiagnosticSeverity.Warning,
    },
  ];

  for (const { pattern, message, severity } of injectionPatterns) {
    let match: RegExpExecArray | null;
    pattern.lastIndex = 0; // Reset regex state

    while ((match = pattern.exec(code)) !== null) {
      try {
        const start = match.index;
        const end = start + match[0].length;
        const range = new vscode.Range(
          document.positionAt(start),
          document.positionAt(end)
        );

        const diagnostic = new vscode.Diagnostic(
          range,
          `[SECURITY] ${message} - Found: "${match[0].substring(0, 30)}${
            match[0].length > 30 ? '...' : ''
          }"`,
          severity
        );
        diagnostic.source = 'CodeArmor';
        diagnostics.push(diagnostic);
      } catch (err) {
        console.error(`Error processing match: ${err}`);
      }

      if (match.index === pattern.lastIndex) {
        pattern.lastIndex++;
      }
    }
  }

  return diagnostics;
}
