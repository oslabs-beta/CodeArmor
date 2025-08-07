//Loads the file content,
// parses it (using Babel or TypeScript), applies all rules, and collects violations.

import { parse } from '@babel/parser'; // Tool to convert code into an AST
import { allRules } from '../rules'; // List of all security rules (e.g., noSecretsRule)

export function runRules(code: string, fileName: string) {
  
  // Convert the code string into an AST(Abstract Syntax Tree) that rules can analyze
  const ast = parse(code, {
    sourceType: 'module',
    plugins: ['typescript', 'jsx'], // Handle TS and React code
  });

  const violations: any[] = []; // Array to collect all issues found

  // For each rule you've defined
  for (const rule of allRules) {
    
    // Run the rule on the AST and file name
    const ruleResults = rule.run(ast, fileName);

    // Add any violations from this rule to the total list
    violations.push(...ruleResults);
  }

  return violations; // Return all collected security issues
}

// Here is a AST Ex. you declare a variable like normal const token = "abc123_token_secret";
/* Then an AST is created {
  "type": "VariableDeclaration",
  "declarations": [
    {
      "type": "VariableDeclarator",
      "id": { "name": "token" },
      "init": {
        "type": "StringLiteral",
        "value": "abc123_token_secret"
      }
    }
  ]
}
kinda of like machine code organized for improved understanding 
of the machine running the code but instead of complete gibberish(binary)
it is a lot closer to the source code in appearance. 
*/
