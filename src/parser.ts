// src/parser.ts
import * as babelParser from '@babel/parser';
import traverse from '@babel/traverse';
import * as vscode from 'vscode';
import { hardCodedSecretsRule } from './rules/nonHardCodedSecrets';
import { iamWildcardVisitor } from './rules/iamWildcards'; //- new rule

export function parser(
  code: string,
  document: vscode.TextDocument
): vscode.Diagnostic[] {
  const diagnostics: vscode.Diagnostic[] = [];
  let hasHandler = false;

  const ast = babelParser.parse(code, {
    sourceType: 'module',
    plugins: ['typescript', 'jsx'],
    ranges: true,
  });


  const visitor = {
    AssignmentExpression(path: any) {
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
    ...iamWildcardVisitor(document, diagnostics),
  };

  traverse(ast, visitor);

  if (!hasHandler) {
    return [];
  }
  // Run regex-based rule(s)
  diagnostics.push(...hardCodedSecretsRule(code, document));

  return diagnostics;
}
