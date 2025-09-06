// src/parser.ts from parser-update
// this update does handler-only scanning for serverless security
// the handler function (Lambda) is the entry point where every incoming event is processed
// the handler is where the user input meets the highest risk zone - handler runs on every request
// handler-scope means only warnings come from request-time vulnerabilities - low noise
// fewer false positives, better UX, higher developer adoption, aligns with serverless security requirements
// stretch feature: optional module-scope scanning - scanning outside the handler

import * as babelParser from '@babel/parser'; // babel turns file's text to AST
import traverse, { NodePath } from '@babel/traverse'; //import AST walker, NodePath typings for safer access to node paths
import * as t from '@babel/types'; //import Babel node type guards and type definitions (ex. t.isfunctionExression)
import * as vscode from 'vscode'; // provides textdocument type and diagnostic object

import { hardCodedSecretsRule } from './rules/nonHardCodedSecrets'; //regex based rule
import { noCodeInjectionRule } from './rules/noCodeInjection'; // regex-based rule
import { iamWildcardVisitor } from './rules/iamWildcards'; //visitor factory that returns traversal callbacks to detect risky IAM wildcard usage

/** Helper function to replace characters in the specific file range [s, e) with spaces to keep length and indices the same */
function maskRange(chars: string[], s: number, e: number) {
  const end = Math.min(e, chars.length); // make sure ending index never goes past end of array
  for (let i = Math.max(0, s); i < end; i++) {
    // run loop as long as i < end
    chars[i] = ' '; // replace character with space
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
    ranges: true, // true adds start/end character positions to nodes (absolute character offsets)
  }) as unknown as t.File & {
    // cast ast to unknown, then to t.File root node to access body and comments properties
    comments?: Array<{ start?: number | null; end?: number | null }>; // defines comments only if comments exist in t.File
  };

  const comments = ast.comments ?? []; //grab comments Babel found in code to mask out later; if comments don't exist return empty array

  // Discover: exports.handler = (function/arrow)
  let hasHandler = false;
  let handlerStart: number | undefined;
  let handlerEnd: number | undefined;
  let handlerBodyPath: NodePath<t.BlockStatement> | undefined; //handler body boundaries and nodepath of body to traverse
  // NodePath is an AST wrapper that stores the node itself, range, traversal helpers like path.get

  traverse(ast, {
    // as we traverse through the tree, each node of ast is "visited"
    AssignmentExpression(path) {
      // AssignmentExpression function is called when this type of node is visited
      const { node } = path; // path is the current node's location in AST, short for path.node

      // match left side of assignment for exports.handler
      if (
        t.isMemberExpression(node.left) &&
        t.isIdentifier(node.left.object, { name: 'exports' }) &&
        t.isIdentifier(node.left.property, { name: 'handler' })
      ) {
        const rhs = node.right; // rhs is what the handler is assigned to

        // case 1: check if function expression exports.handler = function (...) {...}; not an arrow function
        if (t.isFunctionExpression(rhs) && rhs.body) {
          if (rhs.body.start !== null && rhs.body.end !== null) {
            hasHandler = true;
            handlerStart = rhs.body.start ?? undefined; // beginning of '{' body
            handlerEnd = rhs.body.end ?? undefined; // end of '}' body

            const rightPath = path.get(
              // gets child path pointing to rhs node
              'right'
            ) as NodePath<t.FunctionExpression>;
            handlerBodyPath = rightPath.get(
              'body'
            ) as NodePath<t.BlockStatement>; // digs into function body and wraps it in nodepath
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
            handlerStart = rhs.body.start ?? undefined; //beginning of function body
            handlerEnd = rhs.body.end ?? undefined; // end of function body

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
  const chars = code.split(''); // entire file text split into array of single-character strings

  // Mask outside the handler body - regex will only match inside it
  maskRange(chars, 0, handlerStart);
  maskRange(chars, handlerEnd, code.length);

  // Mask comments that intersect the handler body - regex won't match comments
  // iterate all parsed comments from ast.comments
  // c.start and c.end offsets where comments begin and end;

  for (const c of comments) {
    const cStart = typeof c.start === 'number' ? c.start : undefined;
    const cEnd = typeof c.end === 'number' ? c.end : undefined;

    // if any offset is missing; continue and skip
    if (cStart === undefined || cEnd === undefined) {
      continue;
    }

    const s = Math.max(handlerStart, cStart);
    const e = Math.min(handlerEnd, cEnd);
    if (e > s) {
      maskRange(chars, s, e); //mask the comments within comment range
    }
  }

  // put the whole file back together but with everything outside the handler being masked in spaces
  const maskedCode = chars.join('');

  // Run regex-based rules on mased code; matches only happen inside the handler body, indices align with document
  // each rule returns an array of diagnostics; spread unpacks arrays so all findings in one flat array for VS Code
  diagnostics.push(
    ...hardCodedSecretsRule(maskedCode, document),
    ...noCodeInjectionRule(maskedCode, document)
  );

  // Scope IAM Wildcard checks strictly to the handler body by traversing only the subtree
  // iamWildCardVisitor pushes into diagnostics
  const iamVisitor = iamWildcardVisitor(document, diagnostics); //creates visitor object to scan wildcard issues
  traverse(
    handlerBodyPath.node as any, //restrict traversal to handler body only
    iamVisitor as any, // visitor object with detection logic
    handlerBodyPath.scope, // lexical scope object for handler body
    undefined,
    handlerBodyPath
  );

  // post-filter: keep the diagnostics only inside handler body; for safety, final line of defense

  // assign offsets of handler to start and end
  const start = handlerStart;
  const end = handlerEnd;

  // filter the diagnostics array; for each diagnostic d, compute absolute start and end offset
  const filtered = diagnostics.filter((d) => {
    const s = document.offsetAt(d.range.start);
    const e = document.offsetAt(d.range.end);
    return s >= start! && e <= end!; // only return if span of diagnostic is in the handler
  });

  return filtered;
}
