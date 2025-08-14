// // The module 'vscode' contains the VS Code extensibility API
// // Import the module and reference it with the alias vscode in your code below
// import * as vscode from 'vscode';

// // This method is called when your extension is activated
// // Your extension is activated the very first time the command is executed
// export function activate(context: vscode.ExtensionContext) {
//   // Use the console to output diagnostic information (console.log) and errors (console.error)
//   // This line of code will only be executed once when your extension is activated
//   console.log('Congratulations, your extension "codearmor" is now active!');

//   // The command has been defined in the package.json file
//   // Now provide the implementation of the command with registerCommand
//   // The commandId parameter must match the command field in package.json
//   const disposable = vscode.commands.registerCommand(
//     'codearmor.helloWorld',
//     () => {
//       // The code you place here will be executed every time your command is executed
//       // Display a message box to the user
//       vscode.window.showInformationMessage('Hello World from CodeArmor!');
//     }
//   );

//   context.subscriptions.push(disposable);

//   const diagnosticCollection =
//     vscode.languages.createDiagnosticCollection('myExtension');
//   context.subscriptions.push(diagnosticCollection);

//   // Listen on opened file
//   vscode.workspace.onDidOpenTextDocument((doc) => {
//     updateDiagnostics(doc, diagnosticCollection);
//   });

//   // Diagnose file
//   if (vscode.window.activeTextEditor) {
//     updateDiagnostics(
//       vscode.window.activeTextEditor.document,
//       diagnosticCollection
//     );
//   }

//   // Hover message
//   context.subscriptions.push(
//     vscode.languages.registerHoverProvider(
//       { scheme: 'file', language: 'javascript' },
//       {
//         provideHover(document, position, token) {
//           const range = document.getWordRangeAtPosition(position);
//           const word = document.getText(range);
//           if (word === 'hello') {
//             return new vscode.Hover('Hello to you, too!');
//           }
//           return null;
//         },
//       }
//     )
//   );
// }

// function updateDiagnostics(
//   document: vscode.TextDocument,
//   collection: vscode.DiagnosticCollection
// ): void {
//   const diagnostics: vscode.Diagnostic[] = [];

//   const text = document.getText();
//   const regex = /\bhello\b/g;
//   let match;
//   while ((match = regex.exec(text))) {
//     const startPos = document.positionAt(match.index);
//     const endPos = document.positionAt(match.index + match[0].length);
//     const range = new vscode.Range(startPos, endPos);
//     const diagnostic = new vscode.Diagnostic(
//       range,
//       'CodeArmor says:',
//       vscode.DiagnosticSeverity.Warning
//     );
//     diagnostics.push(diagnostic);
//   }

//   collection.set(document.uri, diagnostics);
// }

// // This method is called when your extension is deactivated
// export function deactivate() {}
