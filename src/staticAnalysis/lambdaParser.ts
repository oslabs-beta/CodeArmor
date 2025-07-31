import * as babelParser from '@babel/parser'; //babel parser turns code to AST
import traverse from '@babel/traverse'; //helps traverse node in AST
import * as vscode from 'vscode'; // brings VScode api to show diagnostic in editor

import { applySecretsRule } from './secretsRule'; // loads rule for hardcoded secrets
import { applyIamWildcardRule } from './IamRule'; // loads rule for Iam
import { showDiagnostics } from '..utils/diagnostics'; // helper to send results to the editor


// entry point from extension.ts, code is the text, document is the active file in editor
export function analyzeCode(code: string, document: vscode.TextDocument) {
    // parse code into ast
    const ast = babelParser.parse(code, {
        sourceType: 'module',             // expect ECMAscript module syntax
        plugins: ['typescript', 'jsx'], //support for typescript, js, react
    });

    // initialize array to hold diagnostic matches
    const matches: vscode.Diagnostic[] = [];

    // traverse node, for every AssignmentExpression, get the node
    traverse(ast, {
        AssignmentExpression(path) {    //NodePath object wraps around AST node with extra info and methods
          const node = path.node;       //extracts just the raw AST node

            // does the left side of the node (member expression) have exports.handler?
            // exports.handler identifies the expression as a lambda function handler
          if (
            node.left.type === 'MemberExpression' &&
            node.left.object.type === 'Identifier' &&
            node.left.object.name === 'exports' &&
            node.left.property.type === 'Identifier' &&
            node.left.property.name === 'handler'
          ) {
            console.log('Lambda handler on line:', node.loc?.start.line); //optional chaining
          }
        },

        StringLiteral(path) {
            const value = path.node.value; // extract the value of stringliteral in node

            // apply the regex rule to hardcoded secrets and and assign it to result
            const secretsResult = applySecretsRule(value);

            // if conditions are true push result in matches diagnostic array
            if (secretsResult) {
                matches.push(makeDiagnostic(secretsResult.message, path));
              }

            const iamResult = applyIamWildcardRule(value);
            if (iamResult) {
                matches.push(makeDiagnostic(iamResult.message, path));
              }

        },
    });

    showDiagnostics(matches, document);
}

// helper function to create diagnostic from Babel AST node path

function makeDiagnostic(message: string, path: any): vscode.Diagnostic {
    return new vscode.Diagnostic(

 );

}
