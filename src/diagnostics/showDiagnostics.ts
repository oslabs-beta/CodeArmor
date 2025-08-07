import * as vscode from 'vscode';

const diagnosticCollection =
  vscode.languages.createDiagnosticCollection('securityScan');

export function showDiagnostics(uri: vscode.Uri, message: string, path: any) {
  const range = new vscode.Range(
    path.node.loc.start.line - 1, //Babel's line numbers are 1-based (first line is 1)
    path.node.loc.start.column, // VS Code Range API uses 0-based
    path.node.loc.end.line - 1, // -1 converts Babel 1-based line to vsCode 0-based
    path.node.loc.end.column
  );

  const diagnostics = new vscode.Diagnostic(
    range,
    message,
    vscode.DiagnosticSeverity.Warning
  );

  diagnosticCollection.set(uri, [diagnostics]);
}
