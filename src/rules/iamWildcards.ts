// / src/rules/iamWildcards.ts
import * as vscode from 'vscode';
import * as t from '@babel/types';
/**
Babel visitor that detects overly permissive IAM policies (wildcards in Action/Resource).
 */
export function iamWildcardVisitor(
  document: vscode.TextDocument,
  diagnostics: vscode.Diagnostic[]
) {
  return {
    ObjectExpression(path: any) {
      const node = path.node;
      let hasActionStar = false;
      let hasResourceStar = false;
      node.properties.forEach((prop: any) => {
        if (!t.isObjectProperty(prop)) {
            return;
        }
        if (!t.isIdentifier(prop.key) && !t.isStringLiteral(prop.key)) {
            return;
        }
        const key = t.isIdentifier(prop.key)
          ? prop.key.name
          : prop.key.value;
        const value = prop.value;
        if (key === 'Action' || key === 'Resource') {
          if (t.isStringLiteral(value) && value.value === '*') {
            if (key === 'Action') {
                hasActionStar = true;
            }
            if (key === 'Resource') {
                hasResourceStar = true;
            }
          }
          if (t.isArrayExpression(value)) {
            const wildcard = value.elements.some(
              (el) => t.isStringLiteral(el) && el.value === '*'
            );
            if (wildcard) {
              if (key === 'Action') {
                hasActionStar = true;
              }
              if (key === 'Resource') {
                hasResourceStar = true;
              }
            }
          }
        }
      });
      if (hasActionStar || hasResourceStar) {
        const range = new vscode.Range(
          document.positionAt(node.start!),
          document.positionAt(node.end!)
        );
        diagnostics.push(
          new vscode.Diagnostic(
            range,
            `Overly permissive IAM policy: ${
              hasActionStar && hasResourceStar
                ? 'Action and Resource are "*"'
                : hasActionStar
                ? 'Action is "*"'
                : 'Resource is "*"'
            }`,
            vscode.DiagnosticSeverity.Warning
          )
        );
      }
    },
  };
}











