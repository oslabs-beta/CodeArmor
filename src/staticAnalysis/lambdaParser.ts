import * as babelParser from '@babel/parser'; //babel parser turns code to AST
import traverse from '@babel/traverse'; //helps traverse node in AST
import * as vscode from 'vscode'; // brings VScode api to show diagnostic in editor

import { applyAwsSecretsRule } from './awsSecretsRule';
import { applyIamWildcardRule } from './iamRule'; // brings rule for Iam permissions
//import { showDiagnostics } from '..utils/diagnostics'; // helper to send results to the editor


// entry point from extension.ts, code is the text, document is the active file in editor
export function analyzeCode(code: string, document: vscode.TextDocument) {

    // babelParser.parse -function converts source code into ast
    // first argument is code from active vscode editor
    // second argument is options object - defines source type and plugins
    const ast = babelParser.parse(code, {
        sourceType: 'module',             // expect ECMAscript module syntax (import/export)
        plugins: ['typescript', 'jsx'], // to understand syntax of typescript, js, react
    });

    // initialize array to hold diagnostic matches
    // vscode.Diagnostic is a data structure used by vscode extensions to describe problem found in document
    // It contains range, message, severity, code for problem, source, extra info

    const matches: vscode.Diagnostic[] = [];

    // traverse walks through AST - first argument is ast; second argument is visitorObject 
    // for every AssignmentExpression, get the node
    traverse(ast, {
        AssignmentExpression(path) {    //NodePath object wraps around AST node with metadata and helper methods
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
            console.log('Lambda handler on line:', node.loc?.start.line); // ?-optional chaining operator
          }
        },

        StringLiteral(path) {
            const value = path.node.value; // extract the value of stringliteral in node

  
            // rule 1: apply the regex rule to aws hardcoded secret key and and assign it to result
            const awsSecretsResult = applyAwsSecretsRule(value);

        
            // if hardcoded secret is present, push Diagnostic object into matches array
            if (awsSecretsResult) {
                matches.push(makeDiagnostic(awsSecretsResult.message, path));
              }


            // rule 2: if Iam is overly permissive; push Diagnostic object into matches array
            const iamResult = applyIamWildcardRule(value);
            if (iamResult) {
                matches.push(makeDiagnostic(iamResult.message, path));
              }

        },
    });


    // run function in diagnostics file to show warning in vs code automatically
//    showDiagnostics(matches, document);
}

// helper function to create vscode.Diagnostic object from Babel AST node path
// first argument is the warning message, second is the node path object from AST
// returns vscode.Diagnostic object to be sent to the editor

function makeDiagnostic(message: string, path: any): vscode.Diagnostic {
    return new vscode.Diagnostic(

        // range object that tells us exact location of issue in the file - start and end positions
        // loc object added after Babel parses code - tells where the AST node is in the file


        new vscode.Range(
            path.node.loc.start.line - 1,  //Babel's line numbers are 1-based (first line is 1)
            path.node.loc.start.column,    // VS Code Range API uses 0-based
            path.node.loc.end.line - 1,    // -1 converts Babel 1-based line to vsCode 0-based
            path.node.loc.end.column
          ),
          message,                           //warning text
          vscode.DiagnosticSeverity.Warning  // tells us how severe  - 

    );

}
