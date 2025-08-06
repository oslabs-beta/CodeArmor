// test script
/**
 * Manual test script for Code Armor extension.
 * 
 * This script:
 * 1. Loads a sample serverless function (insecure.js)
 * 2. Parses it into an AST using Babel
 * 3. Detects if the file defines an AWS Lambda handler (`exports.handler`)
 * 4. If yes, it runs deep rule checks (overly permissive IAM policies, AWS secret keys)
 * 5. Then it logs security violations or safe results to the console
 * 
 * Invoke with: npx ts-node src/test/testLambdaParser.ts
 */

import fs from 'fs';                  // import file system module from Node.js
import path from 'path';               // import path module 
import { parse } from '@babel/parser';  // get the parse function from Babel
import traverse from '@babel/traverse';  // utlity that takes an AST and visits each node in the tree
import * as t from '@babel/types';       // import all the babel types package and group into t

import { applyIamWildcardRule } from '../staticAnalysis/iamRule'; // import rule functions to test
import { applyAwsSecretsRule } from '../staticAnalysis/awsSecretsRule';

// Path to sample input file
const filePath = path.join(__dirname, '../sample-lambdas/insecure.js');
const code = fs.readFileSync(filePath, 'utf-8');  //returns contents of file into string

// Parse code to AST
const ast = parse(code, {         // first argument is active code in vs editor
  sourceType: 'module',           // second argument is options object
  plugins: ['typescript', 'jsx'],   // define source type and plugins
});

let hasLambdaHandler = false;   // initialize handler detector to false
const violations: string[] = [];  // initialize violations message array

// Traverse AST to detect handler, IAM wildcard, and AWS Secret Key
traverse(ast, {                       // first argument is ast, second is visitor object

  // rule 1: check for exports.handler
  AssignmentExpression(path) {
    const node = path.node;
    if (
      t.isMemberExpression(node.left) &&
      t.isIdentifier(node.left.object, { name: 'exports' }) &&
      t.isIdentifier(node.left.property, { name: 'handler' })
    ) {
      hasLambdaHandler = true;
      console.log('Detected Lambda handler: exports.handler');
    }
  },
 
  // Rule 2: only runs if handler is present
  ObjectExpression(path) {
    if (!hasLambdaHandler) return;

    const result = applyIamWildcardRule(path.node);
    if (result) {
      violations.push(result);
    }
  },
  // Rule 3: AWS secret detection (lightweight — always run)
  StringLiteral(path) {
    const result = applyAwsSecretsRule(path.node.value);
    if (result) {
      violations.push(result);
    }
  }
  
});

// Print results
if (!hasLambdaHandler) {
    console.log('No Lambda handler found — skipping deep rules.');
  }
  
  if (violations.length === 0) {
    console.log('No security violations detected.');
  } else {
    violations.forEach((v, i) => {
      console.log(`Violation ${i + 1}:`, v);
    });
  }
