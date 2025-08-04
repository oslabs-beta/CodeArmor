// test script
/**
 * Manual test script for Code Armor extension.
 * 
 * This script:
 * 1. Loads a sample serverless function (insecure.js)
 * 2. Parses it into an AST using Babel
 * 3. Detects if the file defines an AWS Lambda handler (`exports.handler`)
 * 4. If yes, it runs deep rule checks (e.g., overly permissive IAM policies)
 * 5. Then it logs security violations or safe results to the console
 * 
 * Invoke with: npx ts-node src/test/testLambdaParser.ts
 */

import fs from 'fs';                  // import file system module from Node.js
import path from 'path';               // import path module 
import { parse } from '@babel/parser';  // get the parse function from Babel
import traverse from '@babel/traverse';  // utlity that takes an AST and visits each node in the tree
import * as t from '@babel/types';       // import all the babel types package and group into t
import { applyIamWildcardRule } from '../staticAnalysis/iamRule'; // import rule function to test

// Path to sample input file
const filePath = path.join(__dirname, '../sample-lambdas/insecure.js');
const code = fs.readFileSync(filePath, 'utf-8');  //returns contents of file into string

// Parse code to AST
const ast = parse(code, {
  sourceType: 'module',
  plugins: ['typescript', 'jsx'],
});

let hasLambdaHandler = false;
const violations: string[] = [];

// Traverse AST to detect handler and IAM wildcard
traverse(ast, {
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

  ObjectExpression(path) {
    if (!hasLambdaHandler) return;

    const result = applyIamWildcardRule(path.node);
    if (result) {
      violations.push(result);
    }
  }
});

// Print results
if (!hasLambdaHandler) {
  console.log('No Lambda handler found — skipping deep rules.');
} else if (violations.length > 0) {
  violations.forEach((v, i) => {
    console.log(`❗ Violation ${i + 1}:`, v);
  });
} else {
  console.log('No IAM wildcard violations detected.');
}
