// src/diagnostic.ts
import * as vscode from 'vscode';

const diagnosticCollection =
  vscode.languages.createDiagnosticCollection('securityScan');

export function showDiagnostics(uri: vscode.Uri, message: string, path: any) {
  if (!path.node.loc) {
    console.warn('Node location missing, skipping diagnostic:', path.node);
    return;
  }

  const range = new vscode.Range(
    path.node.loc.start.line - 1,
    path.node.loc.start.column,
    path.node.loc.end.line - 1,
    path.node.loc.end.column
  );

  const diagnostics = new vscode.Diagnostic(
    range,
    message,
    vscode.DiagnosticSeverity.Warning
  );
  console.log('Adding diagnostic:', message, range);

  diagnosticCollection.set(uri, [diagnostics]);
}