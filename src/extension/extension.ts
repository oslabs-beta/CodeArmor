import * as vscode from 'vscode'; // Import VS Code API
import { runRules } from '../rulesEngine/runRules'; // Import function to run security rules
import { showDiagnostics } from '../diagnostics/showDiagnostics'; // Import function to display issues

// Function that VS Code calls when your extension is activated
export function activate(context: vscode.ExtensionContext) {
  
  // Register a new command called 'extension.scanSecurity'
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.scanSecurity', () => {

      // Get the currently open text editor
      const editor = vscode.window.activeTextEditor;

      // If there is an open editor, run the scan on its document
      if (editor) {
        handleDocument(editor.document);
      }
    })
  );
}

// Function that handles scanning a specific document
async function handleDocument(document: vscode.TextDocument) {
  
  // Only scan JavaScript or TypeScript files
  if (
    document.languageId !== 'javascript' &&
    document.languageId !== 'typescript'
  ) {
    return; // Exit early if not JS or TS
  }

  // Get the full text and filename of the document
  const fileText = document.getText();
  const fileName = document.fileName;

  // Run your security rules on the file content
  const results = runRules(fileText, fileName);

  // Show any issues found in the VS Code editor
  showDiagnostics(document.uri, results);
}
