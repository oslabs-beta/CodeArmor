// src/parser.ts
// this update does handler-only scanning for serverless security
// the handler function (Lambda) is the entry point where every incoming event is processed
// the handler is where the user input meets the highest risk zone - handler runs on every request
// handler-scope means only warnings come from request-time vulnerabilities - low noise
// fewer false positives, better UX, higher developer adoption, aligns with serverless security requirements
// stretch feature: optional module-scope scanning - scan outside the handler

import * as babelParser from '@babel/parser'; // bael turns file's text to AST
import traverse, { NodePath } from '@babel/traverse'; //import AST walker, NodePath typings for safer access to node paths
import * as t from '@babel/types'; //import Babel node type guards and type definitions (ex. t.isfunctionExression)
import * as vscode from 'vscode'; // provides textdocument type and diagnostic object

import { hardCodedSecretsRule } from './rules/nonHardCodedSecrets'; //regex based rule
import { noCodeInjectionRule } from './rules/noCodeInjection'; // regex-based rule
import { iamWildcardVisitor } from './rules/iamWildcards'; //visitor factory that returns traversal callbacks to detect risky IAM wildcard usage

/** Replace characters in entire file [s, e) with spaces to keep length and indices the same */
function maskRange(chars: string[], s: number, e: number) {
  const end = Math.min(e, chars.length);
  for (let i = Math.max(0, s); i < end; i++) {
    chars[i] = ' ';
  }
}

export function parser(
  code: string, // entry point -take file contents and VS Code document
  document: vscode.TextDocument
): vscode.Diagnostic[] {
  const diagnostics: vscode.Diagnostic[] = []; // return diagnostics collection where findings are pushed

  // parse with ranges + comments to map positions and strip safely
  const ast = babelParser.parse(code, {
    // parse text to an AST
    sourceType: 'module', // module supports ESM syntax
    plugins: ['typescript', 'jsx'], // plugins enable Typescript JSX parsing
    ranges: true, // true adds start/end character positions to nodes
  }) as unknown as t.File & {
    comments?: Array<{ start?: number | null; end?: number | null }>;
  };

  const comments = ast.comments ?? []; //grab comment spans to mask out later

  // Discover: exports.handler = (function/arrow)
  let hasHandler = false;
  let handlerStart: number | undefined;
  let handlerEnd: number | undefined;
  let handlerBodyPath: NodePath<t.BlockStatement> | undefined; //handler body boundaries and nodepath to body to traverse

  traverse(ast, {
    AssignmentExpression(path) {
      const { node } = path;

      // match left side: exports.handler
      if (
        t.isMemberExpression(node.left) &&
        t.isIdentifier(node.left.object, { name: 'exports' }) &&
        t.isIdentifier(node.left.property, { name: 'handler' })
      ) {
        const rhs = node.right;

        // case 1: function expression exports.handler = function (...) {...}
        if (t.isFunctionExpression(rhs) && rhs.body) {
          if (rhs.body.start !== null && rhs.body.end !== null) {
            hasHandler = true;
            handlerStart = rhs.body.start ?? undefined;
            handlerEnd = rhs.body.end ?? undefined;

            const rightPath = path.get(
              'right'
            ) as NodePath<t.FunctionExpression>;
            handlerBodyPath = rightPath.get(
              'body'
            ) as NodePath<t.BlockStatement>;
          }
        }

        // case 2: block-body arrow exports.handler = (...) => {...}
        if (
          t.isArrowFunctionExpression(rhs) &&
          rhs.body &&
          t.isBlockStatement(rhs.body)
        ) {
          if (rhs.body.start !== null && rhs.body.end !== null) {
            // only handle block-body arrows: () => {...}
            hasHandler = true;
            handlerStart = rhs.body.start ?? undefined;
            handlerEnd = rhs.body.end ?? undefined;

            const rightPath = path.get(
              'right'
            ) as NodePath<t.ArrowFunctionExpression>;
            handlerBodyPath = rightPath.get(
              'body'
            ) as NodePath<t.BlockStatement>;
          }
        }
        // currently supports exports.handler = function/arrow {}; can insert other handlers here
      }
    },
  });

  // Lambda handler-only scope: if no handler body was found, return no diagnostics.
  if (
    !hasHandler ||
    handlerStart === undefined ||
    handlerEnd === undefined ||
    !handlerBodyPath
  ) {
    return [];
  }

  // Build a masked copy of the file (same length as original);
  // 1) Mask everything outside the handler body
  // 2) Mask comments inside the handler body
  // masked code looks identical in length to original but only handler code is readable
  const chars = code.split('');

  // Mask outside the handler body - regex and only match inside it
  maskRange(chars, 0, handlerStart);
  maskRange(chars, handlerEnd, code.length);

  // Mask comments that intersect the handler body - regex won't match comments
  for (const c of comments) {
    const cStart = typeof c.start === 'number' ? c.start : undefined;
    const cEnd = typeof c.end === 'number' ? c.end : undefined;

    if (cStart === undefined || cEnd === undefined) {
      continue;
    }

    const s = Math.max(handlerStart, cStart);
    const e = Math.min(handlerEnd, cEnd);
    if (e > s) {
      maskRange(chars, s, e);
    }
  }

  const maskedCode = chars.join('');

  // Run regex-based rules; matches only happen inside the handler body, indices align with document
  diagnostics.push(
    ...hardCodedSecretsRule(maskedCode, document),
    ...noCodeInjectionRule(maskedCode, document)
  );

  // Scope IAM Wildcard checks strictly to the handler body by traversing only the subtree
  // iamWildCardVisitor pushes into diagnostics
  const iamVisitor = iamWildcardVisitor(document, diagnostics);
  traverse(
    handlerBodyPath.node as any,
    iamVisitor as any,
    handlerBodyPath.scope,
    undefined,
    handlerBodyPath
  );

  // post-filter: keep the diagnostics only inside handler body
  const start = handlerStart;
  const end = handlerEnd;
  const filtered = diagnostics.filter((d) => {
    const s = document.offsetAt(d.range.start);
    const e = document.offsetAt(d.range.end);
    return s >= start! && e <= end!;
  });

  return filtered;
}

// src/parser.ts - extension-iamRule
// import * as babelParser from '@babel/parser';
// import traverse from '@babel/traverse';
// import * as vscode from 'vscode';
// import { hardCodedSecretsRule } from './rules/nonHardCodedSecrets';
// import { noCodeInjectionRule } from './rules/noCodeInjection';
// import { iamWildcardVisitor } from './rules/iamWildcards';

// export function parser(
//   code: string,
//   document: vscode.TextDocument
// ): vscode.Diagnostic[] {
//   const diagnostics: vscode.Diagnostic[] = [];
//   let hasHandler = false;

//   const ast = babelParser.parse(code, {
//     sourceType: 'module',
//     plugins: ['typescript', 'jsx'],
//     ranges: true,
//   });

//   const visitor = {
//     AssignmentExpression(path: any) {
//       const node = path.node;
//       if (
//         node.left.type === 'MemberExpression' &&
//         node.left.object.type === 'Identifier' &&
//         node.left.object.name === 'exports' &&
//         node.left.property.type === 'Identifier' &&
//         node.left.property.name === 'handler'
//       ) {
//         hasHandler = true;
//       }
//     },
//     ...iamWildcardVisitor(document, diagnostics),
//   };

//   traverse(ast, visitor);

//   if (!hasHandler) {
//     return [];
//   }
//   // Run regex-based rule(s)
//   diagnostics.push(...hardCodedSecretsRule(code, document));
//   diagnostics.push(...noCodeInjectionRule(code, document));

//   return diagnostics;
// }

// // src/parser.ts - OLD
// import * as babelParser from '@babel/parser';
// import traverse from '@babel/traverse';
// import * as vscode from 'vscode';
// import { hardCodedSecretsRule } from './rules/nonHardCodedSecrets';
// import { noCodeInjectionRule } from './rules/noCodeInjection';

// export function parser(
//   code: string,
//   document: vscode.TextDocument
// ): vscode.Diagnostic[] {
//   const diagnostics: vscode.Diagnostic[] = [];

//   const ast = babelParser.parse(code, {
//     sourceType: 'module',
//     plugins: ['typescript', 'jsx'],
//     ranges: true,
//   });

//   let hasHandler = false;

//   traverse(ast, {
//     AssignmentExpression(path) {
//       const node = path.node;
//       if (
//         node.left.type === 'MemberExpression' &&
//         node.left.object.type === 'Identifier' &&
//         node.left.object.name === 'exports' &&
//         node.left.property.type === 'Identifier' &&
//         node.left.property.name === 'handler'
//       ) {
//         hasHandler = true;
//       }
//     },
//   });

//   if (!hasHandler) {
//     return diagnostics;
//   }

//   // Run all security rules
//   diagnostics.push(...hardCodedSecretsRule(code, document));
//   diagnostics.push(...noCodeInjectionRule(code, document));

//   return diagnostics;
// }
