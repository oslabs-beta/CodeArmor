//Takes rule violations 
// and uses VS Code APIs to show them as diagnostics in the editor gutter.

import * as vscode from "vscode";

// Create a diagnostic collection (shared across all calls)
const diagnosticCollection = vscode.languages.createDiagnosticCollection("securityScan");

export function showDiagnostics(uri: vscode.Uri, violations: Array<{ message: string; location: any }>) {
  // Convert each violation into a VS Code Diagnostic
  const diagnostics = violations.map(violation => {
    const loc = violation.location;

    // Babel location is 1-based, VS Code Range is 0-based
    const range = new vscode.Range(
      (loc.start.line || 1) - 1,
      (loc.start.column || 0),
      (loc.end.line || 1) - 1,
      (loc.end.column || 0)
    );

    return new vscode.Diagnostic(range, violation.message, vscode.DiagnosticSeverity.Warning);
  });

  // Set the diagnostics for this file URI
  diagnosticCollection.set(uri, diagnostics);
}
