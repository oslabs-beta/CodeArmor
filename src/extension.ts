// src/extension.ts
import * as vscode from 'vscode';
import { parser } from './parser';

export function activate(context: vscode.ExtensionContext) {
  console.log('Security Linter Extension is now active!');

  const diagnosticCollection =
    vscode.languages.createDiagnosticCollection('securityScan');

  const runScan = (document: vscode.TextDocument) => {
    if (
      document.languageId !== 'javascript' &&
      document.languageId !== 'typescript'
    )
      return;
    const code = document.getText();
    const diagnostics = parser(code, document);
    diagnosticCollection.set(document.uri, diagnostics);
  };

  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument(runScan),
    vscode.workspace.onDidChangeTextDocument((e) => runScan(e.document)),
    vscode.commands.registerCommand('extension.scanSecurity', () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) runScan(editor.document);
    }),
    vscode.languages.registerHoverProvider(
      [
        { scheme: 'file', language: 'javascript' },
        { scheme: 'file', language: 'typescript' },
      ],
      {
        provideHover(document, position) {
          const diagnostics = diagnosticCollection.get(document.uri);
          if (!diagnostics) return;
          for (const diag of diagnostics) {
            if (diag.range.contains(position)) {
              return new vscode.Hover(diag.message);
            }
          }
        },
      }
    )
  );
}

export function deactivate() {}
