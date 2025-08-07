// Define your security rule as an object with a 'run' method
export const noSecretsRule = (value: string): any => {
  // 'run' function gets called with the parsed AST and filename
  //   run(ast: any, fileName: string) {
  const results: any[] = []; // List to hold any violations we find

  //   const awsSecretKeyPattern = /api[_-]?key|secret|token|password/;
  const awsSecretKeyPattern = /\bhello\b/g;

  // If the string looks like a secret (e.g., contains 'apiKey', 'token', etc)
  if (awsSecretKeyPattern.test(value)) {
    // Record a violation with message and location
    results.push({
      message: `Potential hardcoded secret: "${value}"`,
      //   location: path.node.loc,
    });
  }

  //   return results; // Return all the violations found
  //   },
  return `Potential hardcoded secret: "${value}"`;
};
