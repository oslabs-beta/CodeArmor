import * as assert from 'assert';
import * as vscode from 'vscode';
import { runRules } from '../../rulesEngine/runRules';
import { parse } from '@babel/parser';

suite('noSecretsRule Integration Test', () => {
  test('flags hardcoded secrets in active editor', async () => {
    const code = `
      const apiKey = "12345secretkey";
      const token = "token_abc123";
      const safe = "hello";
    `;

    const doc = await vscode.workspace.openTextDocument({
      content: code,
      language: 'typescript',
    });

    await vscode.window.showTextDocument(doc);

    const ast = parse(doc.getText(), {
      sourceType: 'module',
      plugins: ['typescript'],
    });

    const results = runRules(code, 'test-file.ts');

    assert.strictEqual(results.length, 2);
    assert.match(results[0].message, /hardcoded/i);
  });
});

