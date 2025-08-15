// src/parser.ts
import * as babelParser from '@babel/parser';
import traverse from '@babel/traverse';
import * as vscode from 'vscode';
import { hardCodedSecretsRule } from './rules/nonHardCodedSecrets';
import { noCodeInjectionRule } from './rules/noCodeInjection';

export function parser(
  code: string,
  document: vscode.TextDocument
): vscode.Diagnostic[] {
  const diagnostics: vscode.Diagnostic[] = [];

  const ast = babelParser.parse(code, {
    sourceType: 'module',
    plugins: ['typescript', 'jsx'],
    ranges: true,
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

  // Run all security rules
  diagnostics.push(...hardCodedSecretsRule(code, document));
  diagnostics.push(...noCodeInjectionRule(code, document));

  return diagnostics;
}