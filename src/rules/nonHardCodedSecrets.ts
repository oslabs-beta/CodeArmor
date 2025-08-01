//A rule that flags hardcoded strings resembling API keys, tokens, etc.

import traverse from "@babel/traverse";
import * as t from "@babel/types";

export const noSecretsRule = {
  run(ast: any, fileName: string) {
    const results: any[] = [];

    traverse(ast, {
      StringLiteral(path) {
        const value = path.node.value;
        if (/api[_-]?key|secret|token|password/i.test(value)) {
          results.push({
            message: `Potential hardcoded secret: "${value}"`,
            location: path.node.loc,
          });
        }
      },
    });

    return results;
  },
};