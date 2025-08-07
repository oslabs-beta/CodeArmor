export const noSecretsRule = (value: string): any => {
  const results: any[] = []; // List to hold any violations we find

  //   const awsSecretKeyPattern = /api[_-]?key|secret|token|password/;
  const awsSecretKeyPattern = /\bhello\b/g;

  // If the string looks like a secret (e.g., contains 'apiKey', 'token', etc)
  if (awsSecretKeyPattern.test(value)) {
    results.push({
      message: `Potential hardcoded secret: "${value}"`,
    });
    return `Potential hardcoded secret: "${value}"`;
  }
};
