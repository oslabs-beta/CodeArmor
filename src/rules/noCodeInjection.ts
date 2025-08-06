import { NodePath } from '@babel/traverse'; 
import * as t from '@babel/types';
import { Rule, Violation } from '../rulesEngine/types';

export const noCodeInjectionRule: Rule = {
  name: 'no-code-injection',
  description: 'Detects dangerous dynamic code evaluation patterns',
  run(ast: t.Node, fileName: string): Violation[] {
    const violations: Violation[] = [];

    const visitor = {
      // 1. Detect eval() - Arbitrary code execution calls
      CallExpression(path: NodePath<t.CallExpression>) {
        // check to see if the called fuction is exactly 'eval'
        if (t.isIdentifier(path.node.callee, { name: 'eval' })) {
          addViolation({
            node: path.node,
            message: 'CRITICAL: eval() usage detected - allows arbitrary code execution',
            suggestion: 'Use safe alternatives like JSON.parse() for data processing',
            fileName
          });
        }
      },

      // 2. Detect new Function() - Dynamic function generation 
      NewExpression(path: NodePath<t.NewExpression>) {
        if (t.isIdentifier(path.node.callee, { name: 'Function' })) {
          addViolation({
            node: path.node,
            message: 'CRITICAL: new Function() detected - enables code injection',
            suggestion: 'Pre-compile functions instead of dynamic generation',
            fileName
          });
        }
      },
    }

    // Helper function to standardize violations
    function addViolation({
      node,
      message,
      suggestion,
      fileName,
      severity = 'high'
    }: {
      node: t.Node;
      message: string;
      suggestion: string;
      fileName: string;
      severity?: 'high' | 'medium' | 'low';
    }) {
      if (!node.loc) return; // skip if no location data
      
      violations.push({
        message,
        severity,
        ruleId: 'no-code-injection',
        suggestion,
        location: {
          startLine: node.loc.start.line,
          startCol: node.loc.start.column,
          endLine: node.loc.end.line,
          endCol: node.loc.end.column,
          file: fileName
        }
      });
    }

    require('@babel/traverse').default(ast, visitor);
    return violations;
  }
};