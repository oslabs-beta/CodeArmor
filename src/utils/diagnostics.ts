import * as vscode from 'vscode';

// Create a persistent diagnostic collection
const diagnosticCollection = vscode.languages.createDiagnosticCollection('code-armor');

/**
 * Displays an array of diagnostics in the VS Code editor.
 * Associates the diagnostics with the provided document using a DiagnosticCollection.
 *
 * @param diagnostics - Array of vscode.Diagnostic objects containing the issues to display
 * @param document - The VS Code document in which the diagnostics should be shown
 */
export function showDiagnostics(diagnostics: vscode.Diagnostic[], document: vscode.TextDocument): void {
  diagnosticCollection.set(document.uri, diagnostics);
}