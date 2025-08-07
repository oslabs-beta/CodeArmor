//A rule that flags hardcoded strings resembling API keys, tokens, etc.

import traverse from "@babel/traverse"; // Tool to walk through the AST
import * as t from "@babel/types"; // (Optional) Babel types library, used to identify node types

// Define your security rule as an object with a 'run' method
export const noSecretsRule = {
  
  // 'run' function gets called with the parsed AST and filename
  run(ast: any, fileName: string) {
    const results: any[] = []; // List to hold any violations we find

    // Traverse the AST, looking for string literals
    traverse(ast, {
      StringLiteral(path) {
        const value = path.node.value;

        // If the string looks like a secret (e.g., contains 'apiKey', 'token', etc)
        if (/api[_-]?key|secret|token|password/i.test(value)) {

          // Record a violation with message and location
          results.push({
            message: `Potential hardcoded secret: "${value}"`,
            location: path.node.loc,
          });
        }
      },
    });

    return results; // Return all the violations found
  },
};
