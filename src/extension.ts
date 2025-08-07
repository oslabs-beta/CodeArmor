// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { parser } from './parser';
import { showDiagnostics } from './diagnostics/showDiagnostics';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "codearmor" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  const disposable = vscode.commands.registerCommand(
    'codearmor.helloWorld',
    () => {
      // The code you place here will be executed every time your command is executed
      // Display a message box to the user
      vscode.window.showInformationMessage('Hello World from CodeArmor!');
    }
  );

  context.subscriptions.push(disposable);

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

  // Hover message
  context.subscriptions.push(
    vscode.languages.registerHoverProvider(
      { scheme: 'file', language: 'javascript' },
      {
        provideHover(document, position, token) {
          return new vscode.Hover('Hello to you, too!');
        },
      }
    )
  );
}

// This method is called when your extension is deactivated
export function deactivate() {}

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
  const results = parser(fileText, document);

  // Show any issues found in the VS Code editor
  //   if (results) {
  //     showDiagnostics(document.uri, results.message, results.path);
  //   }
}
