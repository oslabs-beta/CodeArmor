// src/rule.ts
import * as vscode from 'vscode';

/**
 * Regex-based rule: flag every standalone word "hello" in the document
 * Return a list of Diagnostics with proper ranges computed from document offsets.
 */
export function regexHelloRule(
  code: string,
  document: vscode.TextDocument
): vscode.Diagnostic[] {
  const diagnostics: vscode.Diagnostic[] = [];
  const pattern = /\b[A-Za-z0-9/+=]{40}\b/g; // case-insensitive; use /g to find all matches

  let match: RegExpExecArray | null;
  while ((match = pattern.exec(code)) !== null) {
    const start = match.index;
    const end = start + match[0].length;

    const range = new vscode.Range(
      document.positionAt(start),
      document.positionAt(end)
    );

    diagnostics.push(
      new vscode.Diagnostic(
        range,
        'Hardcoded secrets detected',
        vscode.DiagnosticSeverity.Warning
      )
    );

    // Avoid zero-length match infinite loops just in case
    if (pattern.lastIndex === match.index) pattern.lastIndex++;
  }

  return diagnostics;
}
