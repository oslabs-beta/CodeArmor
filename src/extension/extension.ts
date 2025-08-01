import * as vscode from 'vscode';
import { runRules } from '../rulesEngine/runRules';
import { showDiagnostics } from '../diagnostics/showDiagnostics';

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.scanSecurity', () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        handleDocument(editor.document);
      }
    })
  );
}

async function handleDocument(document: vscode.TextDocument) {
  if (
    document.languageId !== 'javascript' &&
    document.languageId !== 'typescript'
  ) {
    return;
  }

  const fileText = document.getText();
  const fileName = document.fileName;

  const results = runRules(fileText, fileName);
  showDiagnostics(document.uri, results);
}
