// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { analyzeCode } from './staticAnalysis/lambdaParser';

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

  // context.subscriptions.push(disposable);

  // Trigger analysis when a JavaScript/TypeScript file is saved
  const watcher = vscode.workspace.onDidSaveTextDocument((document) => {
    const languageId = document.languageId;
    const fileType = document.uri.fsPath;
    console.log('💾 File saved');

    // Only run analyzer on .js or .ts files
    if (languageId === 'javascript' || languageId === 'typescript') {
      const code = document.getText();

      try {
        analyzeCode(code, document);
        console.log('CodeArmor analysis completed');
      } catch (error) {
        console.error('CodeArmor error during analysis, error');
        vscode.window.showErrorMessage(
          'CodeArmor failed to analyze the file. See console for details.'
        );
      }
    } else {
      console.log('Skipped file');
    }
  });
  context.subscriptions.push(disposable);
  context.subscriptions.push(watcher);
}

// This method is called when your extension is deactivated
export function deactivate() {
  console.log('🛑 CodeArmor extension deactivated.');
}
