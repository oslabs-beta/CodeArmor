import * as path from 'path';
import Mocha from 'mocha';
import { glob } from 'glob';

export async function run(): Promise<void> {
  const mocha = new Mocha({ ui: 'tdd', color: true });
  const testsRoot = path.resolve(__dirname);

  try {
    const files = await glob('**/*.test.js', { cwd: testsRoot });

    for (const file of files) {
      mocha.addFile(path.resolve(testsRoot, file));
    }

    return new Promise((resolve, reject) => {
      mocha.run((failures) => {
        failures > 0
          ? reject(new Error(`${failures} tests failed`))
          : resolve();
      });
    });
  } catch (err) {
    return Promise.reject(err);
  }
}
