// src/rule.ts
import { link } from 'fs';
import * as vscode from 'vscode';

/**
 * Regex-based rule: flag every standalone word "hello" in the document
 * Return a list of Diagnostics with proper ranges computed from document offsets.
 */
export function hardCodedSecretsRule(
  code: string,
  document: vscode.TextDocument
): vscode.Diagnostic[] {
  const diagnostics: vscode.Diagnostic[] = [];
  // const pattern = /\b[A-Za-z0-9/+=]{40}\b/g;
  const secretPatterns = [
    // AWS Access Key ID
    /AKIA[0-9A-Z]{16}/g,
    // GitHub Personal Access Token
    /ghp_[a-zA-Z0-9]{36}/g,
    // Stripe Secret Key (live)
    /sk_live_[a-zA-Z0-9]{24}/g,
    // Database connection string with username:password
    /(postgres|mysql):\/\/[a-zA-Z0-9]+:.*@/g,
    /\b[A-Za-z0-9/+=]{40}\b/g,
  ];

  let match: RegExpExecArray | null;
  /*
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
    */

  for (let i = 0; i < secretPatterns.length; i++) {
    while ((match = secretPatterns[i].exec(code)) !== null) {
      const start = match.index;
      const end = start + match[0].length;

      const range = new vscode.Range(
        document.positionAt(start),
        document.positionAt(end)
      );

      diagnostics.push(
        new vscode.Diagnostic(
          range,
          'Hardcoded secrets detected. Learn more: https://blog.gitguardian.com/why-its-urgent-to-deal-with-your-hard-coded-credentials/ \n Please remove from codebase. At minimum please put them in a env file',
          vscode.DiagnosticSeverity.Warning
        )
      );
    }
  }
  return diagnostics;
}
