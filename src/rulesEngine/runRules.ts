//Loads the file content,
// parses it (using Babel or TypeScript), applies all rules, and collects violations.

import { parse } from '@babel/parser';
import { allRules } from '../rules';

export function runRules(code: string, fileName: string) {
  const ast = parse(code, {
    sourceType: 'module',
    plugins: ['typescript', 'jsx'],
  });

  const violations: any[] = [];

  for (const rule of allRules) {
    const ruleResults = rule.run(ast, fileName);
    violations.push(...ruleResults);
  }

  return violations;
}