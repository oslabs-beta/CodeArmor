// src/parser.ts
import * as babelParser from '@babel/parser';
import traverse from '@babel/traverse';
import * as vscode from 'vscode';

export function parser(
  code: string,
  document: vscode.TextDocument
): vscode.Diagnostic[] {
  const diagnostics: vscode.Diagnostic[] = [];

  const ast = babelParser.parse(code, {
    sourceType: 'module',
    plugins: ['typescript', 'jsx'],
  });

  let hasHandler = false;

  traverse(ast, {
    AssignmentExpression(path) {
      const node = path.node;
      if (
        node.left.type === 'MemberExpression' &&
        node.left.object.type === 'Identifier' &&
        node.left.object.name === 'exports' &&
        node.left.property.type === 'Identifier' &&
        node.left.property.name === 'handler'
      ) {
        hasHandler = true;
      }
    },
  });

  if (!hasHandler) return diagnostics;

  // if handler exists, scan for hardcoded "hello"
  traverse(ast, {
    StringLiteral(path) {
      if (path.node.value === 'hello') {
        const loc = path.node.loc;
        if (!loc) return;
        const range = new vscode.Range(
          loc.start.line - 1,
          loc.start.column,
          loc.end.line - 1,
          loc.end.column
        );

        const diagnostic = new vscode.Diagnostic(
          range,
          "Found hard coded secrets 'hello'",
          vscode.DiagnosticSeverity.Warning
        );

        diagnostics.push(diagnostic);
      }
    },
  });

  return diagnostics;
}
